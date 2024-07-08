import { useEffect } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

import { ToastContainer } from "react-toastify";

import {
  Route,
  Switch,
  useLocation,
  BrowserRouter as Router,
} from "react-router-dom";
// import LogoNav from "../../assets/pixelwork/new-logo.png";

import Dashboard from './components/Dashboard';
import NftStaking from "./components/NFTStaking";
import TWMs from "./components/TWMs";
import Footer from "./components/Footer";
import Claim from "./components/pages/Claim";
import Navbar from "./components/Nav";
import Rarities from "./components/pages/Rarities";

export const Home = () => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (hash === "") {
      window.scrollTo(0, 0);
    } else {
      setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView();
        }
      }, 10);
    }
  }, [pathname, hash, key]);

  return (
    <div className="app">
      <Router>
        <Navbar />
        <Switch>
          <Route exact path="/">
            <ToastContainer pauseOnFocusLoss={false} />
            <Dashboard />
          </Route>
          <Route path="/staking" component={NftStaking}></Route>
          <Route path="/claim" component={Claim}></Route>
          <Route path="/rarities" component={Rarities}></Route>
        </Switch>
        <TWMs />
        <Footer />
      </Router>
    </div>
  );
};

export default Home;
