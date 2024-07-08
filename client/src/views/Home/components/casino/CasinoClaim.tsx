import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useWeb3React } from "@web3-react/core";
import { ethers, BigNumber } from "ethers";
import Spinner from "../Spinner";


import usePersonalInfo from "../../../../hooks/usePersonalInfo";
import useSocket from "../../../../hooks/useSocket";

function CasinoClaim() {
    const { account } = useWeb3React();
    const {
        handleDepositSol,
        updateFund,
        updateFundStatus,
        depositingFlag,
        setDepositingFlag,
        poolState,
        updateWithdrawStatus,
        handleWithdrawSol,
        withdrawingFlag,
        withdrawSuccessFlag,
        setWithdrawingFlag,
        setWithdrawSuccessFlag,
        setRequestWithdraw
    } = usePersonalInfo();
    const curSocket = useSocket();
    const [diceAmount, setDiceAmount] = useState<string>("");
    const [recvAmount, setRecvAmount] = useState<number>(0);
    const [withdrawFlag, setWithdrawFlag] = useState<boolean>(true);
    const [pendingDepositFlag, setPendingDepositFlag] = useState<boolean>(false);
    const [pendingWithdrawFlag, setPendingWithdrawFlag] =
        useState<boolean>(false);
    const [pendingWithdrawAmount, setPendingWithdrawAmount] = useState<number>(0);

    const checkNumber = (value: string) => {
        const reg = /^-?\d*(\.\d*)?$/;
        if (
            (!isNaN(Number(value)) && reg.test(value)) ||
            value === "" ||
            value === "-"
        ) {
            return true;
        }
        return false;
    };


    const handleSolChange = (event: any) => {
        if (checkNumber(event.target.value)) {
            setDiceAmount(event.target.value);
            setRecvAmount(Number(event.target.value));
        }
    };

    useEffect(() => {
        updateFund();
        updateFundStatus();
    }, []);

    useEffect(() => {
        if (poolState.status == "default") {
            setPendingDepositFlag(false);
            setPendingWithdrawFlag(false);
            setPendingWithdrawAmount(0);
        } else if (poolState.status == "deposited") {
            setPendingDepositFlag(true);
        } else if (poolState.status == "withdraw required") {
            setPendingWithdrawFlag(true);
            setPendingWithdrawAmount(
                (Number(poolState.amount))
            );
        }
    }, [poolState.status]);

    useEffect(() => {
        if (withdrawingFlag) {
            setWithdrawFlag(true);
            setWithdrawingFlag(false);
            toast.warn(`Withdrawing Fail!`, {
                position: "bottom-left",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    }, [withdrawingFlag]);

    useEffect(() => {
        if (withdrawSuccessFlag) {
            setWithdrawFlag(true);
            setWithdrawSuccessFlag(false);
            toast.success(`Withdraw Success!`, {
                position: "bottom-left",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    }, [withdrawSuccessFlag]);


    const handleDiceChange = (event: any) => {
        setDiceAmount(event.target.value);
        setRecvAmount(Number(event.target.value));
    };

    return (<>
        {
            !pendingDepositFlag && !pendingWithdrawFlag ? (
                <>
                    <div className="popup__panel-wrapper">
                        <div className="staking_container">

                            <div className="staking-title">Depositing Info </div>
                            <div className="dash_line dash_line_staking"></div>
                            <div className="staking-stat-wrapper">
                                <div className="card">
                                    <div className="staking_subtitle">
                                        Claiming $TWMT
                                    </div>
                                    <input type="text" className="details-input" value={diceAmount} onChange={handleDiceChange} />
                                </div>
                            </div>

                            <div className="" style={{ color: "", margin: "20px" }}></div>

                            <div className="staking-title">Notification</div>

                            <div className="dash_line dash_line_staking"></div>
                            <div style={{ color: "rgb(141, 255, 31)", margin: "20px 0px -10px", textAlign: "center", fontSize: "20px" }}>
                                <span className="text-white text-bold">
                                    The watchmaker bank
                                </span>{" "}
                                provide the Wonderful Ecosystem.
                                <br />If deposit 100 $TWMT on Casino Game, you will get 100 coin from Casino Platform.
                                <a href="https://etherscan.io/address/0xd88f0726dfb175e534213619c4c4a686d09ca743">
                                    <span style={{ color: "#8f26ff", fontWeight: "bold" }}>
                                        {" "}
                                        $TWMT
                                    </span>{" "}
                                </a>
                                is the main coin for playing the Casino.
                                <br /> According to win the betting, you can increase your fund multiply.
                            </div>

                            <div style={{ color: "rgb(141, 255, 31)", margin: "20px 0px -10px", textAlign: "center", fontSize: "20px" }}>Let's go to the moon with <strong>The Watchmaker</strong>.</div>

                            <div className="" style={{ color: "", margin: "20px" }}></div>
                        </div>
                    </div>
                    <div className="staking_bottons-wrapper">
                        {withdrawFlag ? (
                            <div className="popup__button claim__button"
                                onClick={() => {
                                    setWithdrawFlag(false);
                                    handleWithdrawSol(diceAmount);
                                    setDiceAmount("");
                                    setRecvAmount(0);
                                }}>
                                <span>Confirm Claim</span>
                            </div>
                        ) : (
                            <div className="popup__button claim__button" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Spinner type={"small"} />
                            </div>
                        )}
                    </div>
                </>
            ) : pendingWithdrawFlag ? (
                <>
                    <div className="popup__panel-wrapper">
                        <div className="staking_container">

                            <div className="staking-title">Claiming Info </div>
                            <div className="dash_line dash_line_staking"></div>
                            <div className="staking-stat-wrapper">
                                <div className="card" style={{ width: "100%" }}>
                                    <div className="staking_subtitle">
                                        There are some pending claim for you.
                                        You should resolve it first to claim more.
                                    </div>
                                </div>
                            </div>
                            <div className="staking-stat-wrapper">
                                <div className="card">
                                    <div className="staking_subtitle">
                                        Calculated $TWMT
                                    </div>
                                    <div className="details-input">{pendingWithdrawAmount}</div>
                                </div>
                            </div>

                            <div className="" style={{ color: "", margin: "20px" }}></div>

                            <div className="staking-title">Notification</div>

                            <div className="dash_line dash_line_staking"></div>
                            <div style={{ color: "rgb(141, 255, 31)", margin: "20px 0px -10px", textAlign: "center", fontSize: "20px" }}>
                                <span className="text-white text-bold">
                                    The watchmaker bank
                                </span>{" "}
                                provide the Wonderful Ecosystem.
                                <br />If deposit 100 $TWMT on Casino Game, you will get 100 coin from Casino Platform.
                                <a href="https://etherscan.io/address/0xd88f0726dfb175e534213619c4c4a686d09ca743">
                                    <span style={{ color: "#8f26ff", fontWeight: "bold" }}>
                                        {" "}
                                        $TWMT
                                    </span>{" "}
                                </a>
                                is the main coin for playing the Casino.
                                <br /> According to win the betting, you can increase your fund multiply.
                            </div>

                            <div style={{ color: "rgb(141, 255, 31)", margin: "20px 0px -10px", textAlign: "center", fontSize: "20px" }}>Let's go to the moon with <strong>The Watchmaker</strong>.</div>

                            <div className="" style={{ color: "", margin: "20px" }}></div>
                        </div>
                    </div>
                    <div className="staking_bottons-wrapper">
                        {withdrawFlag ? (
                            <div className="popup__button claim__button" onClick={() => {
                                setWithdrawFlag(false);
                                setRequestWithdraw(true);
                            }}>
                                <span>Solve Pending</span>
                            </div>
                        ) : (
                            <div className="popup__button claim__button" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Spinner type={"small"} />
                            </div>
                        )}

                    </div>
                </>) : (<></>)
        }
    </>)
}

export default CasinoClaim;