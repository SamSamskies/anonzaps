import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NostrEvents from "./NostrEvents.jsx";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NostrEvents />
    </QueryClientProvider>
  );
}

export default App;
