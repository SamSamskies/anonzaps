import { useState, useEffect } from "react";
import styles from "./App.module.css";
import { SimplePool } from "nostr-tools/pool";
import lightBolt11Decoder from "light-bolt11-decoder";
import { QRCodeSVG } from "qrcode.react";
import { NoteContent } from "./NoteContent.jsx";

const getEvents = async () => {
  const pool = new SimplePool();
  const relays = ["wss://relay.nostr.band", "wss://nos.lol"];

  try {
    console.log("querying relays");
    const getTag = (tags, tagName) => tags.find((t) => t[0] === tagName)[1];
    const events = await pool.querySync(relays, {
      kinds: [9735],
      "#p": [
        "5495cb8597d0a90e8983d79971b3c528e99c7ce068b991d45375ba03020a63fb", // anonzaps pubkey
      ],
    });

    return events.map(({ id, created_at: createdAt, tags }) => {
      const zapEvent = getTag(tags, "description");
      const extractAmountInSats = (invoice) => {
        try {
          return (
            lightBolt11Decoder
              .decode(invoice)
              .sections.find(({ name }) => name === "amount").value / 1000
          );
        } catch (err) {
          console.error(err);
          return 0;
        }
      };
      const zapAmount = extractAmountInSats(getTag(tags, "bolt11"));
      const getComment = (zapEvent) => {
        try {
          return JSON.parse(zapEvent).content;
        } catch (err) {
          console.error(err);
          console.log(event);
          return "";
        }
      };
      const comment = getComment(zapEvent);

      return { id, createdAt, zapAmount, comment };
    });
  } catch (err) {
    const errorMessage = "something went wrong :(";

    console.log(errorMessage);
    pool.close(relays);
  }

  return (await getEvents()).filter(
    ({ zapAmount, comment }) => comment.length > 0 && zapAmount > 0,
  );
};

function App() {
  const [events, setEvents] = useState([]);
  const getAndSetEventsIfNecessary = async () => {
    if (document.visibilityState === "hidden") {
      return;
    }

    const normalizedEvents = await getEvents();

    if (normalizedEvents.length === 0) {
      return;
    }

    setEvents(normalizedEvents);
  };

  useEffect(() => {
    getAndSetEventsIfNecessary().catch(console.error);

    const interval = setInterval(getAndSetEventsIfNecessary, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <p>anonzaps@lnurlzap.com</p>
        <QRCodeSVG
          value="lightning:LNURL1DP68GURN8GHJ7MRWW4EXC7NPWQHXXMMD9ASHQ6F00FSHQTMWWP6KYVFJDGE826RSWE5RV734WDSH5ANJXCMHV6RJWCMNJWTJX4JKXMPCW9J85AT9WG685MNHDDSHZ7R3WVE8VVRPWD3H2AFKD4ESJ8C73T"
          includeMargin
          size={200}
        />
      </div>
      <div className={styles.eventsContainer}>
        {events
          .sort((a, b) => b.zapAmount - a.zapAmount)
          .map(({ id, comment, zapAmount, createdAt }) => (
            <div key={id} className={styles.item}>
              <div className={styles.details}>
                <span className={styles.zapAmount}>{zapAmount} sats</span>
                <span className={styles.createdAt}>
                  {new Date(createdAt * 1000).toLocaleString([], {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    hourCycle: "h12",
                  })}
                </span>
              </div>
              <div className={styles.comment}>
                <NoteContent content={comment} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
