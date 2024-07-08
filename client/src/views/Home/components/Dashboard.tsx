import { useEffect, useState } from "react";
// import { useHistory } from "react-router-dom"
import Man from "../../../assets/twm/man.gif"
import Map from "../../../assets/twm/map.png"
import Gear0 from "../../../assets/twm/gear0.gif"
import Gear1 from "../../../assets/twm/gear2.gif"
import Gear2 from "../../../assets/twm/gear3.gif"
import Gear3 from "../../../assets/twm/gear5.gif"
import Gear4 from "../../../assets/twm/gear6.gif"
import Gear5 from "../../../assets/twm/gear7.gif"
import Gear6 from "../../../assets/twm/gear8.gif"
import Gear7 from "../../../assets/twm/gear9.gif"
import Gear8 from "../../../assets/twm/gear1.gif"
import Arrow from "../../../assets/twm/arrow.svg"

import { useWeb3React } from "@web3-react/core";
import useTWMFinance from "../../../hooks/useTWMFinance";
import { NftInfo, ReturnInfo } from "../../../twm-finance/types";
import Claim from "./bank/Claim";
import StakeNFTs from "./bank/StakeNFTs";
import UnstakeNFTs from "./bank/UnstakeNFTs";
import StakingStatus from "./bank/StakingStatus";
// import BettingStatus from "./casino/BettingStatus";
// import Betting from "./casino/Betting";
// import CasinoDeposit from "./casino/CasinoDeposit";
// import CasinoClaim from "./casino/CasinoClaim";
import Spinner from "./Spinner";
import Ok from "../../../assets/pixelwork/check-ok.png";
import Fail from "../../../assets/pixelwork/check-fail.png";

function Dashboard() {
  const twmFinance = useTWMFinance();
  const { account } = useWeb3React();
  const [mintedNFTs, setMintedNFTs] = useState<NftInfo[]>([]);
  // const [isMarket, setIsMarket] = useState(false);
  const [isFactory, setIsFactory] = useState(false);
  const [isBank, setIsBank] = useState(false);
  // const [isCasino, setIsCasino] = useState(false);
  // const [isSale, setIsSale] = useState(false);
  const [amount, setAmount] = useState(0);
  // const [limit, setLimit] = useState(0);
  // const [totalSupply, setTotalSupply] = useState(0);
  // const [maxSupply, setMaxSupply] = useState(0);
  const [mintableAmount, setMintableAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [changed, setChange] = useState<boolean>(true);
  const [bankStakedFlag, setBankStakedFlag] = useState(false);
  const [bankUnstakedFlag, setBankUnstakedFlag] = useState(false);
  const [claimFlag, setClaimFlag] = useState(false);
  // const [casinoBetFlag, setCasinoBetFlag] = useState(false);
  // const [casinoDepositFlag, setCasinoDepositFlag] = useState(false);
  // const [casinoClaimFlag, setCasinoClaimFlag] = useState(false);
  const [isV1Holder, setIsV1Holder] = useState(false);
  const [isWhitelist, setIsWhitelist] = useState(false);
  // const [isFreeMinted, setIsFreeMinted] = useState(false);

  const [result, setResult] = useState<ReturnInfo>({
    success: true,
    reason: "",
  });

  // const options = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];  // const options = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

  useEffect(() => {
    async function fetchInfo() {
      try {
        setIsLoading(true);
        if (twmFinance?.myAccount) {
          setIsLoading(true);
          // setIsSale(await twmFinance.saleIsActive());
          // setLimit(await twmFinance.mintLimit());
          // setTotalSupply(await twmFinance.totalSupply());
          // setMaxSupply(await twmFinance.maxSupply());
          setMintableAmount(await twmFinance.mintableAmount());
          setMintedNFTs(await twmFinance.getMintedNFTsForSecond());
          // setIsFreeMinted(await twmFinance.isFreeMintedAddress());
          setIsV1Holder(await twmFinance.isV1Holder());
          setIsWhitelist(await twmFinance.isWhitelist());
        }
        setIsLoading(false);
      } catch (error) {
        if (isLoading) {
          setIsLoading(false);
        }
        console.error(error);
      }
    }

    fetchInfo();
  }, [twmFinance?.myAccount, changed])

  const render = () => {
    setChange(!changed);
  };

  // const onOptionChangeHandler = (event: any) => {
  //   setAmount(event.target.value)
  // }

  const handleWatchShop = (flag: boolean) => {
    if (account) {
      document.body.style.overflow = 'hidden';
      document.getElementById("modal-watch-shop")?.classList.add("open");

      document
        .getElementById("modal-watch-shop")
        ?.addEventListener("click", function () {
          document.getElementById("modal-watch-shop")?.classList.remove("open");
          document.body.style.overflow = 'unset';
        });

    } else {
      document.getElementById("modal-wallet-warn")?.classList.add("open");

      document
        .getElementById("modal-wallet-warn")
        ?.addEventListener("click", function () {
          document.getElementById("modal-wallet-warn")?.classList.remove("open");
        });
    }
  }

  const handleMarket = (flag: boolean) => {
    if (account) {
      document.body.style.overflow = 'hidden';
      document.getElementById("modal-market")?.classList.add("open");

      document
        .getElementById("modal-market")
        ?.addEventListener("click", function () {
          document.getElementById("modal-market")?.classList.remove("open");
          document.body.style.overflow = 'unset';
        });

    } else {
      document.getElementById("modal-wallet-warn")?.classList.add("open");

      document
        .getElementById("modal-wallet-warn")
        ?.addEventListener("click", function () {
          document.getElementById("modal-wallet-warn")?.classList.remove("open");
        });
    }
  }

  const handleFactory = (flag: boolean) => {
    if (account) {
      if (flag) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      setIsFactory(flag);
    } else {
      document.getElementById("modal-wallet-warn")?.classList.add("open");

      document
        .getElementById("modal-wallet-warn")
        ?.addEventListener("click", function () {
          document.getElementById("modal-wallet-warn")?.classList.remove("open");
        });
    }
  }


  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enteredNum = event.target.value;
    if (!Number.isNaN(+enteredNum)) {
      if (Number(enteredNum) > mintableAmount) {
        setAmount(mintableAmount);
      } else {
        setAmount(Number(enteredNum));
      }
    }
  };

  const minthandler = async () => {
    setIsMinting(true);
    if (twmFinance?.myAccount) {
      let res = await twmFinance.publicMintForSecond(amount);
      if (res) {
        setResult(res);
      }

      if (res.success) {
        render();
      }
    }

    document.getElementById("modal-dashboard-result")?.classList.add("open");

    document
      .getElementById("modal-dashboard-result")
      ?.addEventListener("click", function () {
        document.getElementById("modal-dashboard-result")?.classList.remove("open");
      });

    setIsMinting(false);
  }

  const handleBank = (flag: boolean) => {
    if (account) {
      if (flag) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      if (bankStakedFlag) {
        setBankStakedFlag(false)
      }

      if (bankUnstakedFlag) {
        setBankUnstakedFlag(false)
      }

      if (claimFlag) {
        setClaimFlag(false)
      }

      setIsBank(flag);
    } else {
      document.getElementById("modal-wallet-warn")?.classList.add("open");

      document
        .getElementById("modal-wallet-warn")
        ?.addEventListener("click", function () {
          document.getElementById("modal-wallet-warn")?.classList.remove("open");
        });
    }
  }

  // const handleCasino = (flag: boolean) => {
  //   if (account) {
  //     if (flag) {
  //       document.body.style.overflow = 'hidden';
  //     } else {
  //       document.body.style.overflow = 'unset';
  //     }

  //     if (casinoBetFlag) {
  //       setCasinoBetFlag(false);
  //     }

  //     if (casinoDepositFlag) {
  //       setCasinoDepositFlag(true);
  //     }

  //     if (casinoClaimFlag) {
  //       setCasinoClaimFlag(true);
  //     }

  //     setIsCasino(flag);
  //   } else {
  //     document.getElementById("modal-wallet-warn")?.classList.add("open");

  //     document.getElementById("modal-wallet-warn")?.addEventListener("click", function () {
  //       document.getElementById("modal-wallet-warn")?.classList.remove("open");
  //     });
  //   }
  // }

  const handleStake = () => {
    setBankStakedFlag(true);
  }

  const handleUnstake = () => {
    setBankUnstakedFlag(true);
  }

  const handleClaim = () => {
    setClaimFlag(true);
  }

  // const handleCasinoBet = () => {
  //   setCasinoBetFlag(true);
  // }

  // const handleCasinoDeposit = () => {
  //   setCasinoDepositFlag(true);
  // }

  // const handleCasinoClaim = () => {
  //   setCasinoClaimFlag(true);
  // }

  // const handleCasinoArrow = () => {
  //   if (casinoBetFlag) {
  //     setCasinoBetFlag(false);
  //   } else if (casinoDepositFlag) {
  //     setCasinoDepositFlag(false)
  //   } else {
  //     setCasinoClaimFlag(false)
  //   }
  // }

  const handleArrow = () => {
    if (bankStakedFlag) {
      setBankStakedFlag(false);
    } else if (bankUnstakedFlag) {
      setBankUnstakedFlag(false)
    } else {
      setClaimFlag(false)
    }
  }

  const openWarnModal = (e: any) => {
    e.preventDefault();
    document.getElementById("modal-warn")?.classList.add("open");

    document
      .getElementById("modal-warn")
      ?.addEventListener("click", function () {
        document.getElementById("modal-warn")?.classList.remove("open");
      });
  }

  return (
    <>
      <div className="dashboard">
        <img className="floating-item gear-0" src={Gear0} />
        <img className="floating-item gear-1" src={Gear1} />
        <img className="floating-item gear-2" src={Gear2} />
        <img className="floating-item gear-3" src={Gear3} />
        <img className="floating-item gear-4" src={Gear4} />
        <img className="floating-item gear-5" src={Gear5} />
        <img className="floating-item gear-6" src={Gear6} />
        <img className="floating-item gear-7" src={Gear7} />
        <img className="floating-item gear-8" src={Gear8} />

        <div className="dashboard-man">
          <img src={Man} alt="old man" />
        </div>

        <div className="dashboard-map">
          <img src={Map} alt="big gear" />
          <div className="overlie staking-cursor active" onClick={async () => {
            handleBank(true);
          }}></div>
          <div className="overlie market-cursor active" onClick={async (e: any) => {
            handleMarket(true);
          }}></div>
          <div className="overlie watch-shop-cursor active" onClick={async () => {
            handleWatchShop(true);
          }}></div>
          <div className="overlie factory-cursor active" onClick={async () => {
            handleFactory(true);
          }}></div>
          <div className="overlie casino-cursor active" onClick={async () => {
            openWarnModal(e); // handleCasino(true);
          }}></div>
          <div className="overlie pawn-shop-cursor" onClick={async (e: any) => {
            openWarnModal(e);
          }}></div>
        </div>
      </div>

      <div className="overlay" id="modal-warn">
        <div className="modal wrapper-modal">
          <div className="modal-text">
            <strong>Not available yet!</strong>
            <br />
            <br />
          </div>
        </div>
      </div>

      <div className="overlay" id="modal-wallet-warn">
        <div className="modal wrapper-modal">
          <div className="modal-text">
            <strong>Please Connect Wallet First!</strong>
          </div>
        </div>
      </div>

      <div className="overlay" id="modal-market">
        <div className="modal wrapper-modal">
          <div className="modal-text" style={{ textAlign: "start" }}>
            <a href="https://opensea.io/collection/the-watchmaker-nft-collection" target="_blank">
              <strong>•V1 - The Watchmaker Collection</strong>
            </a>
            <br />
            <br />
            <a href="https://opensea.io/collection/the-watchmaker-2-parts-collection" target="_blank">
              <strong>•V2 - The Watchmaker 2: Parts Collection</strong>
            </a>
            <br />
          </div>
        </div>
      </div>

      <div className="overlay" id="modal-watch-shop">
        <div className="modal wrapper-modal">
          <div className="modal-text" style={{ textAlign: "start" }}>
            <a href="https://shop.kylwatches.app" target="_blank">
              <strong>• Go to Watch Shop</strong>
            </a>
          </div>
        </div>
      </div>

      <div className="overlay" id="modal-dashboard-result">
        <div className="modal wrapper-modal">
          <img src={result.success ? Ok : Fail} alt="ok" />
          {result.success ? (
            <div className="modal-text">
              {result.reason}
              <br />
              <a href="#" className="btn-large">
                Thanks!
              </a>
            </div>
          ) : (
            <div className="modal-text">
              <p>{result.reason}</p>
            </div>
          )}
        </div>
      </div>

      {isFactory ? (<div className="popup project__info">
        <div className="popup__panel project__info">
          <div className="card__info card__info-staking">
            <div className="card__info-name card__info-staking-name">
              Factory
            </div>
          </div>
          <div className="popup__button-close" onClick={() => handleFactory(false)}>
            <div className="wrapper"></div>
          </div>
          <div className="popup__panel-wrapper">
            <div className="staking_container">
              <div className="staking-title">Second Collection Mint</div>
              <div className="dash_line dash_line_staking"></div>
              <div className="staking-stat-wrapper">
                <div className="card">
                  <div className="staking_subtitle">
                    Minted V2
                  </div>
                  <div className="details-input">{mintedNFTs.length}</div>
                </div>

                <div className="card">
                  <div className="staking_subtitle">
                    Mintable V2
                  </div>
                  <div className="details-input">{mintableAmount}</div>
                </div>

                <div className="card">
                  <div className="staking_subtitle">
                    V2 Mint Amount
                  </div>

                  <input type="text" className="details-input" value={amount} onChange={inputHandler} />

                  {/* <select className="details-input" onChange={onOptionChangeHandler}>
                    <option>Please choose</option>
                    {options.map((option, index) => {
                      if (!isFreeMinted && mintableAmount > 0 && mintableAmount >= index + 1) {
                        return <option key={index} >
                          {option}
                        </option>
                      } else {
                        if (!(!isFreeMinted && mintableAmount > 0 && mintableAmount < index + 1)) {
                          return <option key={index} >
                            {option}
                          </option>
                        }
                      }
                    })}
                  </select> */}
                </div>
                <div className="card">
                  <div className="staking_subtitle">
                    V1 Holder
                  </div>
                  <div className="details-input">{isV1Holder ? "Yes" : "No"}</div>
                </div>
                <div className="card">
                  <div className="staking_subtitle">
                    Whitelist
                  </div>
                  <div className="details-input">{isWhitelist ? "Yes" : "No"}</div>
                </div>
              </div>
              <div className="" style={{ color: "", margin: "20px" }}></div>
              <div className="staking-title">Minted NFTs from you</div>
              <div className="dash_line dash_line_staking"></div>
              <div className="creepz-layout-wrapper">
                {isLoading ? (
                  <div className="spin-box">
                    <Spinner type={"large"} />
                  </div>
                ) : (
                  mintedNFTs.map((nft, index) => {
                    return (
                      <div className="creep-item" key={index}>
                        <img src={nft.imageUrl} alt="WatchParts Icon" />
                      </div>
                    )
                  })
                )}
              </div>

            </div>
          </div>
          <div className="staking_bottons-wrapper">
            {!isMinting ? (<div className="popup__button stake__button" onClick={minthandler} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span>Mint</span>
            </div>) : (<div className="popup__button stake__button" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Spinner type={"small"} />
            </div>)}
          </div>
        </div>
      </div>) : (<></>)}

      {isBank ? (<div className="popup project__info">
        <div className="popup__panel project__info">
          <div className="card__info card__info-staking">
            <div className="card__info-name card__info-staking-name">
              {!bankStakedFlag && !bankUnstakedFlag && !claimFlag ? (
                <>Bank</>) : (bankStakedFlag ? (<>Enter Staking</>) : (bankUnstakedFlag ? (<>Enter Unstaking</>) : (<>Enter Claiming</>)))}
            </div>
          </div>
          <div className="popup__button-close" onClick={() => handleBank(false)}>
            <div className="wrapper"></div>
          </div>
          {bankStakedFlag || bankUnstakedFlag || claimFlag ? (<div className="popup__button-back" onClick={() => handleArrow()}>
            <div className="wrapper">
              <img src={Arrow} />
            </div>
          </div>) : (<></>)}

          {!bankStakedFlag && !bankUnstakedFlag && !claimFlag ? (
            <>
              <StakingStatus />
              <div className="staking_bottons-wrapper">
                <div className="popup__button stake__button" onClick={() => handleStake()}>
                  <span>Stake</span>
                </div>
                <div className="popup__button unstake__button" onClick={() => handleUnstake()}>
                  <span>Unstake</span>
                </div>
                <div className="popup__button claim__button" onClick={() => handleClaim()}>
                  <span>Claim</span>
                </div>
              </div>
            </>
          ) : (
            bankStakedFlag ? (
              <>
                <StakeNFTs />
              </>
            ) : (
              bankUnstakedFlag ? (
                <>
                  <UnstakeNFTs />
                </>
              ) : (
                <>
                  <Claim />
                </>
              )
            )
          )}
        </div>
      </div>) : (<></>)}

      {/* {isCasino ? (<div className="popup project__info">
        <div className="popup__panel project__info">
          <div className="card__info card__info-staking">
            <div className="card__info-name card__info-staking-name">
              {!casinoBetFlag && !casinoDepositFlag && !casinoClaimFlag ? (
                <>Casino</>) : (casinoBetFlag ? (<>Enter Betting</>) : (casinoDepositFlag ? (<>Enter Deposting</>) : (<>Enter Claiming</>)))}
            </div>
          </div>
          <div className="popup__button-close" onClick={() => handleCasino(false)}>
            <div className="wrapper"></div>
          </div>
          {casinoBetFlag || casinoDepositFlag || casinoClaimFlag ? (<div className="popup__button-back" onClick={() => handleCasinoArrow()}>
            <div className="wrapper">
              <img src={Arrow} />
            </div>
          </div>) : (<></>)}

          {!casinoBetFlag && !casinoDepositFlag && !casinoClaimFlag ? (
            <>
              <BettingStatus />
              <div className="staking_bottons-wrapper">
                <div className="popup__button stake__button" onClick={() => handleCasinoBet()}>
                  <span>Bet</span>
                </div>
                <div className="popup__button unstake__button" onClick={() => handleCasinoDeposit()}>
                  <span>Deposit</span>
                </div>
                <div className="popup__button claim__button" onClick={() => handleCasinoClaim()}>
                  <span>Claim</span>
                </div>
              </div>
            </>
          ) : (
            casinoBetFlag ? (
              <>
                <Betting />
              </>
            ) : (
              casinoDepositFlag ? (
                <>
                  <CasinoDeposit />
                </>
              ) : (
                <>
                  <CasinoClaim />
                </>
              )
            )
          )}
        </div>
      </div>) : (<></>)} */}
    </>
  )
}

export default Dashboard;