import { useWeb3React } from "@web3-react/core";
import useAuth from "../../../hooks/useAuth";
import usePersonalInfo from "../../../hooks/usePersonalInfo";
import { ConnectorNames } from "../../../hooks/useEagerConnect";
import LogoNav from "../../../assets/pixelwork/new-logo.png";
import MarkNav from "../../../assets/twm/mark.png";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react";

function Navbar() {
  const location = useLocation();
  const { deactivate, account } = useWeb3React();
  const { fund, tapFlag, setTapFlag, updateFund } = usePersonalInfo();
  const { login } = useAuth();
  const [isBank, setIsBank] = useState(false);
  const [isClaim, setIsClaim] = useState(false);

  const handleConnectWallet = () => {
    login(ConnectorNames.Injected);
  };

  const handleDeactivateAccount = () => {
    deactivate();
  };

  useEffect(() => {
    if (location.pathname === "/staking") {
      setIsBank(true);
      setIsClaim(false);
    } else if (location.pathname === "/claim") {
      setIsBank(false);
      setIsClaim(true);
    } else {
      setIsBank(false);
      setIsClaim(false);
    }
  }, [location, setIsBank])

  useEffect(() => {
    if (account) {
      updateFund();
      const interval = setInterval(() => {
        updateFund();
      }, 20000);
    }
  }, [account]);

  return (
    <nav className="nav">
      <div className="container">
        <div className="row no-gutters">
          <a className="logo" href="/">
            <img src={LogoNav} width="90px" alt="TWMs" />
          </a>
          <div className="casino"><img src={MarkNav} width="130px" alt="TWMs" /></div>
          <div className="menu">
            {isBank ? (<div className="menu-item">
              <NavLink to="/">Home</NavLink>
            </div>) : (<></>)}

            {isClaim ? (<div className="menu-item">
              <NavLink to="/staking">Bank</NavLink>
            </div>) : (<></>)}
            <div className="menu-item mobile-only">
              {!account ? (
                <button className="btn-large" onClick={handleConnectWallet}>
                  Connect Wallet
                </button>
              ) : (
                <button className="btn-large" onClick={handleDeactivateAccount}>
                  {account?.slice(0, 4) +
                    "..." +
                    account?.slice(account?.length - 4, account?.length)}
                </button>
              )}
            </div>
          </div>
          <div className="wallet">
            {!account ? (
              <button className="btn-large" onClick={handleConnectWallet}>
                Connect Wallet
              </button>
            ) : (
              <button className="btn-large" onClick={handleDeactivateAccount}>
                {account?.slice(0, 4) +
                  "..." +
                  account?.slice(account?.length - 4, account?.length)}
              </button>
            )}
          </div>
          <div className="hamburger">
            <svg
              fill="#fff"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 23 23"
              width="32px"
              height="32px"
            >
              <path d="M 2 5 L 2 7 L 22 7 L 22 5 L 2 5 z M 2 11 L 2 13 L 22 13 L 22 11 L 2 11 z M 2 17 L 2 19 L 22 19 L 22 17 L 2 17 z" />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
