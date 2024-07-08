import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useWeb3React } from "@web3-react/core";
import { ethers, BigNumber } from "ethers";
import useTWMFinance from "../../../../hooks/useTWMFinance";
import Spinner from "../Spinner";


import usePersonalInfo from "../../../../hooks/usePersonalInfo";
import useSocket from "../../../../hooks/useSocket";

function CasinoDeposit() {
    const twmFinance = useTWMFinance();
    const { account } = useWeb3React();
    const {
        handleDepositSol,
        updateFund,
        updateFundStatus,
        depositingFlag,
        setDepositingFlag,
        poolState,
    } = usePersonalInfo();
    const curSocket = useSocket();
    const [approveStatus, setApproveStatus] = useState<boolean>(false);
    const [solAmount, setSolAmount] = useState<string>("");
    const [recvAmount, setRecvAmount] = useState<number>(0);
    const [depositFlag, setDepositFlag] = useState<boolean>(true);
    const [pendingDepositFlag, setPendingDepositFlag] = useState<boolean>(false);
    const [pendingWithdrawFlag, setPendingWithdrawFlag] =
        useState<boolean>(false);
    const [pendingDepositAmount, setPendingDepositAmount] = useState<number>(0);

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
            setSolAmount(event.target.value);
            setRecvAmount(Number(event.target.value));
        }
    };

    const handleApprove = async () => {
        let res = await twmFinance?.approveTWMT(ethers.constants.MaxUint256);
        if (res?.success) {
            setApproveStatus(true)
        }
    };

    useEffect(() => {
        updateFund();
        updateFundStatus();
    }, []);

    useEffect(() => {
        async function fetchInfo() {
            try {
                if (twmFinance?.myAccount) {
                    let allowanceAmount = await twmFinance.allowanceTWMT(twmFinance.myAccount);
                    if (allowanceAmount > BigNumber.from(1)) {
                        setApproveStatus(true);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchInfo();
    }, [twmFinance, account]);

    useEffect(() => {

        if (poolState.status == "default") {
            setPendingDepositFlag(false);
            setPendingWithdrawFlag(false);
            setPendingDepositAmount(0);
        } else if (poolState.status == "deposited") {
            setPendingDepositFlag(true);
            setPendingDepositAmount(
                (Number(poolState.amount))
            );
            updateFund();
        } else if (poolState.status == "withdraw required") {
            setPendingWithdrawFlag(true);
        }
    }, [poolState.status]);

    useEffect(() => {
        if (depositingFlag) {
            setDepositFlag(true);
            setDepositingFlag(false);
            toast.warn(`Deposit Fail!`, {
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
    }, [depositingFlag]);

    useEffect(() => {
        if (curSocket) {
            curSocket.on("message", async (...data: any) => {
                if (data[0].type === "deposit_fund") {
                    if (data[0].ok) {
                        updateFund();
                        toast.success(`Deposit Success!`, {
                            position: "bottom-left",
                            autoClose: 1500,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "dark",
                        });
                    } else {
                        updateFund();
                        toast.warn(`Deposit Fail! Please try again`, {
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
                    setDepositFlag(true);
                    setPendingDepositFlag(false);
                }
            });
        }
    }, [curSocket]);

    return (<>
        {
            !approveStatus ? (
                <>
                    <div className="popup__panel-wrapper">
                        <div className="staking_container">

                            <div className="staking-title">Depositing Info </div>
                            <div className="dash_line dash_line_staking"></div>
                            <div className="staking-stat-wrapper">
                                <div className="card" style={{ width: "100%" }}>
                                    <div className="staking_subtitle">
                                        You should approve first to deposit more.
                                    </div>
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
                        <div className="popup__button claim__button" onClick={() => {
                            handleApprove();
                        }}>
                            <span>Approve</span>
                        </div>
                    </div>
                </>
            ) : (
                !pendingDepositFlag && !pendingWithdrawFlag ? (
                    <>
                        <div className="popup__panel-wrapper">
                            <div className="staking_container">

                                <div className="staking-title">Depositing Info </div>
                                <div className="dash_line dash_line_staking"></div>
                                <div className="staking-stat-wrapper">
                                    <div className="card">
                                        <div className="staking_subtitle">
                                            Depositing Amount
                                        </div>
                                        <input type="text" className="details-input" value={solAmount} onChange={handleSolChange} />
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
                            {depositFlag ? (
                                <div className="popup__button claim__button" onClick={() => {
                                    if (Number(solAmount) >= 0.01) {
                                        setDepositFlag(false);
                                        handleDepositSol(solAmount);
                                        setSolAmount("");
                                        setRecvAmount(0);
                                    } else {
                                        toast.warn(
                                            `Depositing sol amount is small, you should deposit over 0.01 sol!`,
                                            {
                                                position: "bottom-left",
                                                autoClose: 1500,
                                                hideProgressBar: false,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: true,
                                                progress: undefined,
                                                theme: "dark",
                                            }
                                        );
                                    }
                                }}>
                                    <span>Confirm Deposit</span>
                                </div>
                            ) : (
                                <div className="popup__button claim__button" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Spinner type={"small"} />
                                </div>
                            )}
                        </div>
                    </>
                ) : pendingDepositFlag ? (
                    <>
                        <div className="popup__panel-wrapper">
                            <div className="staking_container">

                                <div className="staking-title">Depositing Info </div>
                                <div className="dash_line dash_line_staking"></div>
                                <div className="staking-stat-wrapper">
                                    <div className="card" style={{ width: "100%" }}>
                                        <div className="staking_subtitle">
                                            There are some pending deposit for you.
                                            You should resolve it first to deposit more.
                                        </div>
                                    </div>
                                </div>
                                <div className="staking-stat-wrapper">
                                    <div className="card">
                                        <div className="staking_subtitle">
                                            Calculated $TWMT
                                        </div>
                                        <div className="details-input">{pendingDepositAmount}</div>
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
                            {depositFlag ? (
                                <div className="popup__button claim__button" onClick={() => {
                                    setDepositFlag(false);
                                    handleDepositSol(pendingDepositAmount);
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
            )
        }
    </>)
}
export default CasinoDeposit;