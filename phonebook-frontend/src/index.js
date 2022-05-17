import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  gql,
} from "@apollo/client";
import App from "./App";
import { createRoot } from "react-dom/client";
const container = document.getElementById("app");
//

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "http://localhost:4000",
  }),
});

const query = gql`
  query {
    allPersons {
      name
      phone
      address {
        street
        city
      }
      id
    }
  }
`;

client.query({ query }).then((response) => {
  console.log(response.data);
});

const root = createRoot(container);

root.render(
  <ApolloProvider client={client}>
    <App tab="home" />
  </ApolloProvider>
);
