import { Route, Routes } from "react-router-dom";
import Home from "./pages/Projects";
import Seats from "./pages/Seats"
import TAccounts from "./pages/TAccounst";
import Balance  from "./pages/Balance"

function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/seats/:id" element={<Seats />}/>
      <Route path="/taccounts/:id" element={<TAccounts />}/>
      <Route path="/balance/:id" element={<Balance />}/>
    </Routes>
    </>
  )
}

export default App

