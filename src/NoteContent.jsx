import { Fragment } from "react";

export const NoteContent = ({ content }) => {
  const newlineRegex = /(\r?\n)/gi;
  const hyperlinkRegex = /(https?:\/\/[^\s]+)/gi;
  const wavlakeRegex =
    /(https?:\/\/(?:player\.|www\.)?wavlake\.com\/(?!top|new|artists|account|activity|login|preferences|feed|profile|shows)(?:(?:track|album)\/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}|[a-z-]+))/gi;
  const parts = content.split(
    new RegExp(`(?:${newlineRegex.source}|${hyperlinkRegex.source})`, "gi"),
  );
  const formattedContent = parts.map((part, index) => {
    if (part === undefined || part === "") {
      return null;
    }

    if (part.match(newlineRegex)) {
      return <br key={index} />;
    }

    if (part.match(wavlakeRegex)) {
      const convertedUrl = part.replace(
        /(?:player\.|www\.)?wavlake\.com/,
        "embed.wavlake.com",
      );

      return (
        <iframe
          key={index}
          style={{ borderRadius: 12, borderWidth: 0 }}
          src={convertedUrl}
          width="100%"
          height="380"
          loading="lazy"
          title="WavLake Embed"
        ></iframe>
      );
    }

    if (part.match(hyperlinkRegex)) {
      return (
        <a href={part} key={index} target="_blank">
          {part}
        </a>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });

  return <>{formattedContent}</>;
};
