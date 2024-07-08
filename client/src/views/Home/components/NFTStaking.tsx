import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom"
import styled from "styled-components";
import { useWeb3React } from "@web3-react/core";
import StakedNFT from "./Staking/StakedNFT";
import UnStakedNFT from "./Staking/UnStakedNFT";
import Ok from "../../../assets/pixelwork/check-ok.png";
import Fail from "../../../assets/pixelwork/check-fail.png";
import Spinner from "./Spinner";
import useTWMFinance from "../../../hooks/useTWMFinance";
import { NftInfo, ReturnInfo } from "../../../twm-finance/types";

interface IBtn {
  percent: number;
}

const ProgressBar = styled.div<IBtn>`
  background-color: #8718ed;
  width: ${(props) => props.percent}%;
  border-radius: 20px;
  height: 15px;
`;

export interface AllTWMs {
  stakedTWMs: NftInfo[];
  unstakedTWMs: NftInfo[];
}

function NFTStaking() {
  const history = useHistory();
  const navigatePage = (target: string) => {
    history.push(target)
  }
  const twmFinance = useTWMFinance();
  const { account } = useWeb3React();
  const [myTWMs, setMyTWMs] = useState<AllTWMs>({
    stakedTWMs: [],
    unstakedTWMs: [],
  });
  const [selectedUnstakeIndexes, setSelectedUnstakeIndexes] = useState([]);
  const [selectedStakeIndexes, setSelectedStakeIndexes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [changed, setChange] = useState<boolean>(true);
  const [totalStaked, setTotalStaked] = useState<number>(0);
  const [result, setResult] = useState<ReturnInfo>({
    success: true,
    reason: "",
  });
  const [accumulatedAmount, setAccumulatedAmount] = useState<string>("0");
  const [twtBalance, setTwtBalance] = useState<string>("0");

  const types = ['Staked', 'Unstaked'];
  const tabClassNames = ['defi-tab', 'defi-tab defi-tab-active']
  const [active, setActive] = useState(types[1]);
  const [tokenWithdrawing, setTokenWithdrawing] = useState(false);
  const render = () => {
    setChange(!changed);
  };

  useEffect(() => {
    async function fetchNftsInfo() {
      try {
        setIsLoading(true);
        handleProgress();
        setSelectedStakeIndexes([]);
        setSelectedUnstakeIndexes([]);
        if (twmFinance?.myAccount) {
          let tempStakedTWMs = await twmFinance.getStakedNFTs();
          let tempUnstakedTWMs = await twmFinance.getUnstakedNFTs();
          setMyTWMs({
            stakedTWMs: tempStakedTWMs,
            unstakedTWMs: tempUnstakedTWMs,
          });
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        console.error(err);
      }
    }
    async function fetchAccumulatedAmount() {
      try {
        setResult({ success: true, reason: "" });
        if (account && twmFinance?.myAccount) {
          handleAccumulatedAmount();
          fetchTWTBalance();
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchAccumulatedAmount();
    fetchNftsInfo();
  }, [twmFinance?.myAccount, changed]);

  const handleResult = (e: any) => {
    e.preventDefault();
    document.getElementById("modal-result")?.classList.add("open");
    document
      .getElementById("modal-result")
      ?.addEventListener("click", function (e: any) {
        if (e.target.id === "modal-result") {
          document.getElementById("modal-result")?.classList.remove("open");
        }
      });
  };

  const handleStake = async (e: any) => {
    setIsLoading(true);
    let res = await twmFinance?.depositNFTs(selectedUnstakeIndexes);
    setIsLoading(false);
    if (res) {
      setResult(res);
    }
    handleResult(e);
    if(res?.success) {
      render();
    }
  };

  const handleWithdraw = async (e: any) => {
    setIsLoading(true);
    let res = await twmFinance?.withdraw(selectedStakeIndexes);
    setIsLoading(false);
    if (res) {
      setResult(res);
    }
    handleResult(e);
    if(res?.success) {
      render();
    }
  };

  const handleAllStake = async (e: any) => {
    setIsLoading(true);
    let res = await twmFinance?.stakeAll();
    setIsLoading(false);
    if (res) {
      setResult(res);
    }
    handleResult(e);
    if(res?.success) {
      render();
    }
  };

  const handleAllWithdraw = async (e: any) => {
    setIsLoading(true);
    let res = await twmFinance?.withdrawAll();
    setIsLoading(false);
    if (res) {
      setResult(res);
    }
    handleResult(e);
    if(res?.success) {
      render();
    }
  };

  const handleProgress = async () => {
    let res = await twmFinance?.progressInfo();
    if (res) {
      setTotalStaked(res);
    }
  };

  const handleAccumulatedAmount = async () => {
    const res = await twmFinance?.getAccumulatedAmount();
    if (res) {
      setAccumulatedAmount(res);
    }
  };

  const fetchTWTBalance = async () => {
    const res = await twmFinance?.getTWTBalance();
    if (res) {
      setTwtBalance(res.split(".")[0]);
    }
  };

  return (
    <section className="defi">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="subheading center">READY TO STAKE?</div>
            <div className="heading center">THE WATCHMAKER BANK</div>
            <div className="description center text-bold">
              <span className="text-white text-underline">
                {((totalStaked / 5555) * 100).toFixed(2)}%
              </span>
              <span className="text-white"> TWM Staked ({totalStaked}/</span>
              5555
              <span className="text-white">)</span>
              <div className="description">
                Current <a href="https://etherscan.io/address/0xd88f0726dfb175e534213619c4c4a686d09ca743"><span className="text-important">$TWMT</span></a> balance:{" "}
                {twtBalance}
              </div>
              <div className="description center text-bold">
                <h2 className="text-white text-underline">
                  Current accumulated reward:
                </h2>
                <h2 className="text-white">
                  {" "}
                  {!account
                    ? Number(0).toFixed(2)
                    : Number(accumulatedAmount).toFixed(2)}
                  {" TWMT"}
                </h2>
              </div>
            </div>

            {!account ? (
              <></>
            ) : (
              <>
                <div className="to-center">
                  <button
                    className="btn-large"
                    onClick={async (e: any) => {
                      if (await twmFinance?.isApprovedForAll(account)) {
                        await handleAllStake(e);
                      } else {
                        document
                          .getElementById("modal-approve-all")
                          ?.classList.add("open");
                        window.addEventListener("click", function (e: any) {
                          if (e.target.id === "modal-approve-all") {
                            document
                              .getElementById("modal-approve-all")
                              ?.classList.remove("open");
                          }
                        });
                      }
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner type={"small"} /> : ""} Stake ALL{" "}
                    {!account || !myTWMs.unstakedTWMs.length
                      ? ""
                      : "(" + myTWMs.unstakedTWMs.length + ")"}
                  </button>

                  <button
                    className="btn-large"
                    onClick={async (e: any) => {
                      await handleAllWithdraw(e);
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner type={"small"} /> : ""} Unstake ALL{" "}
                    {!account || !myTWMs.stakedTWMs.length
                      ? ""
                      : "(" + myTWMs.stakedTWMs.length + ")"}
                  </button>

                  <button
                    className="btn-large"
                    onClick={() => navigatePage("/claim")}
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner type={"small"} /> : ""} Claim{" "}
                  </button>
                </div>

                <div className="defi-separator"></div>
                <br />

                {/* <div className="heading center other">
                  <span className="text-white">
                    Staked NFTs{" "}
                    {!account || !myTWMs.stakedTWMs.length
                      ? ""
                      : " - " + myTWMs.stakedTWMs.length}
                  </span>
                </div>

                {isLoading ? (
                  <div className="row defi-row">
                    <div className="spin-box">
                      <Spinner type={"large"} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="row defi-row">
                      {myTWMs.stakedTWMs.map((nft, idx) => {
                        return (
                          <div className="col-xl-3 col-lg-3" key={idx}>
                            <StakedNFT
                              index={nft.id}
                              nftData={nft}
                              indexes={selectedStakeIndexes}
                              changeIndexes={setSelectedStakeIndexes}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="to-center">
                      <button
                        className="btn-large"
                        onClick={async (e: any) => {
                          await handleWithdraw();
                        }}
                        disabled={!account ? true : false}
                      >
                        Confirm Unstake
                      </button>
                    </div>
                  </>
                )}

                <div className="defi-separator"></div>
                <br />
                <div className="heading center other">
                  <span className="text-white">
                    Unstaked NFTs{" "}
                    {!account || !myTWMs.unstakedTWMs.length
                      ? ""
                      : " - " + myTWMs.unstakedTWMs.length}
                  </span>
                </div>

                {isLoading ? (
                  <div className="row defi-row">
                    <div className="spin-box">
                      <Spinner type={"large"} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="row defi-row">
                      {myTWMs.unstakedTWMs.map((nft, idx) => {
                        return (
                          <div className="col-xl-3 col-lg-3" key={idx}>
                            <UnStakedNFT
                              index={nft.id}
                              nftData={nft}
                              indexes={selectedUnstakeIndexes}
                              changeIndexes={setSelectedUnstakeIndexes}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="to-center">
                      <button
                        className="btn-large"
                        onClick={async (e: any) => {
                          if (await twmFinance?.isApprovedForAll(account)) {
                            await handleStake();
                          } else {
                            document
                              .getElementById("modal-approve-all")
                              ?.classList.add("open");
                            window.addEventListener("click", function (e: any) {
                              if (e.target.id === "modal-approve-all") {
                                document
                                  .getElementById("modal-approve-all")
                                  ?.classList.remove("open");
                              }
                            });
                          }
                        }}
                        disabled={!account ? true : false}
                      >
                        Confirm Stake
                      </button>
                    </div>
                  </>
                )} */}

                <div className="defi-tab-group">
                  <div
                    className={active === "Unstaked" ? tabClassNames[1] : tabClassNames[0]}
                    onClick={() => setActive("Unstaked")}
                  >
                    <span className="text-white">
                      Unstaked{" "}
                      {!account || !myTWMs.unstakedTWMs.length
                        ? ""
                        : "(" + myTWMs.unstakedTWMs.length + ")"}
                    </span>
                  </div>

                  <div
                    className={active === "Staked" ? tabClassNames[1] : tabClassNames[0]}
                    onClick={() => setActive("Staked")}
                  >
                    <span className="text-white">
                      Staked{" "}
                      {!account || !myTWMs.stakedTWMs.length
                        ? ""
                        : "(" + myTWMs.stakedTWMs.length + ")"}
                    </span>
                  </div>
                </div>
                {isLoading ? (<div className="row defi-row">
                  <div className="spin-box">
                    <Spinner type={"large"} />
                  </div>
                </div>) : (
                  <>
                    {active === "Staked" ? (
                      <>
                        {myTWMs.stakedTWMs.length > 0 ? (<><br />
                          <div className="to-center">
                            <button
                              className="btn-large"
                              onClick={async (e: any) => {
                                await handleWithdraw(e);
                              }}
                              disabled={!account ? true : false}
                            >
                              Confirm Unstake
                            </button>
                          </div>
                          <div className="row defi-row">
                            {myTWMs.stakedTWMs.map((nft, idx) => {
                              return (
                                <div className="col-xl-3 col-lg-3" key={idx}>
                                  <StakedNFT
                                    index={nft.id}
                                    nftData={nft}
                                    indexes={selectedStakeIndexes}
                                    changeIndexes={setSelectedStakeIndexes}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          <div className="to-center">
                            <button
                              className="btn-large"
                              onClick={async (e: any) => {
                                await handleWithdraw(e);
                              }}
                              disabled={!account ? true : false}
                            >
                              Confirm Unstake
                            </button>
                          </div></>) : (<></>)}

                      </>) : (
                      <>
                        {myTWMs.unstakedTWMs.length > 0 ? (<>
                          <br />
                          <div className="to-center">
                            <button
                              className="btn-large"
                              onClick={async (e: any) => {
                                if (await twmFinance?.isApprovedForAll(account)) {
                                  await handleStake(e);
                                } else {
                                  document
                                    .getElementById("modal-approve-all")
                                    ?.classList.add("open");
                                  window.addEventListener("click", function (e: any) {
                                    if (e.target.id === "modal-approve-all") {
                                      document
                                        .getElementById("modal-approve-all")
                                        ?.classList.remove("open");
                                    }
                                  });
                                }
                              }}
                              disabled={!account ? true : false}
                            >
                              Confirm Stake
                            </button>
                          </div>
                          <div className="row defi-row">
                            {myTWMs.unstakedTWMs.map((nft, idx) => {
                              return (
                                <div className="col-xl-3 col-lg-3" key={idx}>
                                  <UnStakedNFT
                                    index={nft.id}
                                    nftData={nft}
                                    indexes={selectedUnstakeIndexes}
                                    changeIndexes={setSelectedUnstakeIndexes}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          <div className="to-center">
                            <button
                              className="btn-large"
                              onClick={async (e: any) => {
                                if (await twmFinance?.isApprovedForAll(account)) {
                                  await handleStake(e);
                                } else {
                                  document
                                    .getElementById("modal-approve-all")
                                    ?.classList.add("open");
                                  document
                                    .getElementById("modal-approve-all")
                                    ?.addEventListener("click", function (e: any) {
                                      if (e.target.id === "modal-approve-all") {
                                        document
                                          .getElementById("modal-approve-all")
                                          ?.classList.remove("open");
                                      }
                                    });
                                }
                              }}
                              disabled={!account ? true : false}
                            >
                              Confirm Stake
                            </button>
                          </div></>) : (<></>)}

                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="overlay" id="modal-result">
        <div className="modal">
          <img src={result.success ? Ok : Fail} alt="ok" />
          {result.success ? (
            <div className="modal-text">
              <strong>Great!</strong> Success!
              <br />
              <p>Thanks!</p>
            </div>
          ) : (
            <div className="modal-text">
              <strong>Oops!</strong> Failed!
              <br />
              <p>{result.reason}</p>
            </div>
          )}
        </div>
      </div>

      <div className="overlay" id="modal-approve-all">
        <div className="modal" id="modal-area">
          <div className="modal-text lock wrapper-modal">
            <div className="subheading center white">Approved All Nfts</div>
            <div className="defi-separator"></div>
            <a
              className="btn-large"
              style={{ marginTop: "-15px" }}
              onClick={async (e: any) => {
                document
                  .getElementById("modal-approve-all")
                  ?.classList.remove("open");
                setIsLoading(true);
                let res = await twmFinance?.setApproveForAll();
                setIsLoading(false);
                if (res) {
                  setResult(res);
                }
                handleResult(e);
                e.preventDefault();
              }}
            >
              Approve All
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NFTStaking;
