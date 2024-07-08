import { useEffect, useState } from "react"
import { useWeb3React } from "@web3-react/core";
import useTWMFinance from "../../../../hooks/useTWMFinance";
import { ReturnInfo } from "../../../../twm-finance/types";
import Spinner from "../Spinner";
import Ok from "../../../../assets/pixelwork/check-ok.png";
import Fail from "../../../../assets/pixelwork/check-fail.png";

function Claim() {
    const twmFinance = useTWMFinance();
    const { account } = useWeb3React();
    const [accumulatedAmount, setAccumulatedAmount] = useState<string>("0");
    const [currentWithdrawalAmount, setCurrentWithdrawalAmount] = useState<string>("0");
    const [twtBalance, setTwtBalance] = useState<string>("0");
    const [changed, setChange] = useState<boolean>(true);
    const [isStaking, setIsStaking] = useState(false);
    const [result, setResult] = useState<ReturnInfo>({
        success: true,
        reason: "",
    });

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

    const fetchWithdrawalAmount = async () => {
        const res = await twmFinance?.fetchUserRewardBalance();
        if (res) {
            setCurrentWithdrawalAmount(res.split(".")[0]);
        }
    };

    const claimTWT = async (e: any) => {
        setIsStaking(true);
        let res = await twmFinance?.withdrawAllTWMT();
        setIsStaking(false);
        if (res) {
            setResult(res);
        }

        render();
        e.preventDefault();
        document.getElementById("modal-claim-result")?.classList.add("open");

        document
            .getElementById("modal-claim-result")
            ?.addEventListener("click", function () {
                document.getElementById("modal-claim-result")?.classList.remove("open");
            });
    };

    useEffect(() => {
        async function fetchAccumulatedAmount() {
            try {
                setResult({ success: true, reason: "" });
                if (account && twmFinance?.myAccount) {
                    handleAccumulatedAmount();
                    fetchTWTBalance();
                    fetchWithdrawalAmount();
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchAccumulatedAmount();
    }, [account, changed, twmFinance?.myAccount]);

    const render = () => {
        setChange(!changed);
    };

    return (<>
        <div className="popup__panel-wrapper">
            <div className="staking_container">

                <div className="staking-title">The TWMT Reward Status</div>
                <div className="dash_line dash_line_staking"></div>
                <div className="staking-stat-wrapper">
                    <div className="card">
                        <div className="staking_subtitle">
                            Accumulated Reward
                        </div>
                        <div className="details-input">{!account
                            ? Number(0).toFixed(2)
                            : Number(accumulatedAmount).toFixed(2)}</div>
                    </div>
                    <div className="card">
                        <div className="staking_subtitle">
                            Withdrawal Amount
                        </div>
                        <div className="details-input">{!account
                            ? Number(0).toFixed(2)
                            : Number(currentWithdrawalAmount).toFixed(2)}</div>
                    </div>
                    <div className="card">
                        <div className="staking_subtitle">
                            TMWT Balance
                        </div>
                        <div className="details-input">{twtBalance}</div>
                    </div>
                </div>

                <div className="" style={{ color: "", margin: "20px" }}></div>

                <div className="staking-title">Notification</div>

                <div className="dash_line dash_line_staking"></div>
                <div style={{ color: "rgb(141, 255, 31)", margin: "20px 0px -10px", textAlign: "center", fontSize: "20px" }}>
                    <span className="text-white text-bold">
                        The watchmaker bank
                    </span>{" "}
                    is home to <a href="https://etherscan.io/address/0xd88f0726dfb175e534213619c4c4a686d09ca743">$TWMT</a>. 
                    <br />Stake TWM & Utility NFTs in Locked & Unlocked options to
                    earn
                    <a href="https://etherscan.io/address/0xd88f0726dfb175e534213619c4c4a686d09ca743">
                        <span style={{ color: "#8f26ff", fontWeight: "bold" }}>
                            {" "}
                            $TWMT
                        </span>{" "}
                    </a>
                    per day.
                    <br /> Accumulates automatically without the need to claim daily.
                </div>

                <div style={{ color: "rgb(141, 255, 31)", margin: "20px 0px -10px", textAlign: "center", fontSize: "20px" }}><strong>Grandfather</strong> keeps 25% of your Coin as a tax to take it out of the world of watchmaking.</div>

                <div className="" style={{ color: "", margin: "20px" }}></div>


                <div style={{ color: "rgb(141, 255, 31)", margin: "20px 0px -10px", textAlign: "center", fontSize: "20px" }}>For any questions or concerns, please visit{" "}

                    <a href="https://discord.gg/awJY8tYm56">
                        <span className="text-white text-underline">
                            The Watchmaker Discord
                        </span>{" "}
                    </a></div>
            </div>
        </div>
        <div className="staking_bottons-wrapper">
            {!isStaking ? (
                <div className="popup__button claim__button" onClick={async (e: any) => { await claimTWT(e) }}>
                    <span>Confirm Claim</span>
                </div>
            ) : (
                <div className="popup__button claim__button" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Spinner type={"small"} />
                </div>
            )}

        </div>

        <div className="overlay" id="modal-claim-result">
            <div className="modal">
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
    </>)
}

export default Claim;