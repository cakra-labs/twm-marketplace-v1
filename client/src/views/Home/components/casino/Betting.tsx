import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
import usePersonalInfo from "../../../../hooks/usePersonalInfo";
import useSocket from "../../../../hooks/useSocket";
import Rolling from "./Rolling";
import formatAddress from "../../../../utils/formatAddress";
import { useWeb3React } from "@web3-react/core";

function Betting() {
    const { fund, betColor, bettingFlag, winColor } = usePersonalInfo();
    const curSocket = useSocket();
    const { account } = useWeb3React();
    const [amount, setAmount] = useState(0);
    const [green_items, setGreenItems] = useState<any>([]);
    const [same_items, setSameItems] = useState<any>([]);
    const [blue_items, setBlueItems] = useState<any>([]);


    const addItems = (color: string, wallet: string, amount: number) => {
        if (color === "green") {
            setGreenItems((prev: any) => {
                return [{ wallet: wallet, amount: amount }, ...prev];
            });
        }

        if (color === "same") {
            setSameItems((prev: any) => {
                return [{ wallet: wallet, amount: amount }, ...prev];
            });
        }

        if (color === "blue") {
            // setBlueItems((prev: any) => {
            //     return [{ wallet: wallet, amount: amount }, ...prev];
            // });

            setBlueItems([...blue_items, { wallet: wallet, amount: amount }])
        }
    };

    useEffect(() => {
        if (curSocket) {
            console.log("initial socket")
            curSocket.on("message", async (...data: any) => {
                if (data[0].type === "betting_start") {
                    setGreenItems([]);
                    setSameItems([]);
                    setBlueItems([]);
                }
                if (data[0].type === "betting") {
                    if (data[0].ok) {
                        addItems(data[0].color, data[0].wallet, data[0].amount);
                    }
                }
            });
        }
    }, [curSocket]);


    useEffect(() => {
    }, [blue_items])

    const handleBetBlue = () => {
        if (amount <= 0 || fund < amount) {
            toast.warning(`You can't bet less than 0`, {
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
            if (bettingFlag && betColor === "") {
                curSocket.emit(
                    "betting",
                    JSON.stringify({
                        wallet: account,
                        amount: amount,
                        type: "blue",
                    })
                );
                toast.success(`Bet ${amount} Dice on Blue Part`, {
                    position: "bottom-left",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            } else if (betColor !== "") {
                toast.error(`You already bet!`, {
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
                toast.error(`Betting is end`, {
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
        }
    }

    const handleBetSame = () => {
        if (amount <= 0 || fund < amount) {
            toast.warning(`You can't bet less than 0`, {
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
            if (bettingFlag && betColor === "") {
                curSocket.emit(
                    "betting",
                    JSON.stringify({
                        wallet: account,
                        amount: amount,
                        type: "same",
                    })
                );
                toast.success(`Bet ${amount} Dice on Blue Part`, {
                    position: "bottom-left",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            } else if (betColor !== "") {
                toast.error(`You already bet!`, {
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
                toast.error(`Betting is end`, {
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
        }
    }

    const handleBetGreen = () => {
        if (amount <= 0 || fund < amount) {
            toast.warning(`You can't bet less than 0`, {
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
            if (bettingFlag && betColor === "") {
                curSocket.emit(
                    "betting",
                    JSON.stringify({
                        wallet: account,
                        amount: amount,
                        type: "green",
                    })
                );
                toast.success(`Bet ${amount} Dice on Green Part`, {
                    position: "bottom-left",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            } else if (betColor !== "") {
                toast.error(`You already bet!`, {
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
                toast.error(`Betting is end`, {
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
        }
    }

    const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const enteredNum = event.target.value;
        if (!Number.isNaN(+enteredNum)) {
            if (Number(enteredNum) > fund) {
                setAmount(fund);
            } else {
                setAmount(Number(enteredNum));
            }
        }
    };

    function Status(props: {
        items: [{ wallet: string; amount: number }]; 
        bgColor: string;
        color: string;
    }): JSX.Element {
        useEffect(() => {
        }, [props.items])
        return (<>
            <div className={winColor === props.color ? "card winning" : "card"}>
                <div className="staking_subtitle">
                    {props.color}  ({props.items.length})
                </div>
                <div style={{ overflow: "auto", maxHeight: "200px", minHeight: "150px" }}>
                    {props.items.map((item: { wallet: string; amount: number }, index: number) => {
                        <div className="staking_stat-row" key={index}>{formatAddress(item.wallet, 4)} + ":" + {item.amount}</div>
                    })}
                </div>
            </div>
        </>)
    }

    return (<>
        <div className="popup__panel-wrapper">
            <div className="rolling_container">
                <div className="rolling-layout-wrapper">
                    <Rolling />
                </div>
                <div className="staking-title">Bet Amount Info</div>
                <div className="dash_line dash_line_staking"></div>

                <div className="staking-stat-wrapper">
                    <div className="card">
                        <div className="staking_subtitle">
                            Ballance
                        </div>
                        <div className="details-input" > {fund} </div>
                    </div>
                    <div className="card">
                        <div className="staking_subtitle">
                            Bet Amount
                        </div>
                        <input type="text" className="details-input" value={amount} onChange={inputHandler} />
                    </div>
                </div>
                <div className="staking-title">Betting Status</div>
                <div className="dash_line dash_line_staking"></div>

                <div className="rolling-stat-wrapper">
                    {/* <div className={winColor === "blue" ? "card winning" : "card"}>
                        <div className="staking_subtitle">
                            Blue
                        </div>
                        <div style={{ overflow: "auto", maxHeight: "200px", minHeight: "150px" }}>
                            {blue_items.map((item: { wallet: string; amount: number }, index: number) => {
                                <div className="staking_stat-row" key={index}>{formatAddress(item.wallet, 4)} + ":" + {item.amount}</div>
                            })}
                        </div>
                    </div>

                    <div className={winColor === "same" ? "card winning" : "card"}>
                        <div className="staking_subtitle">
                            Same
                        </div>
                        <div style={{ overflow: "auto", maxHeight: "200px", minHeight: "150px" }}>
                            {same_items.map((item: { wallet: string; amount: number }, index: number) => {
                                <div className="staking_stat-row" key={index}>{formatAddress(item.wallet, 4)} + ":" + {item.amount}</div>
                            })}
                        </div>
                    </div>

                    <div className={winColor === "green" ? "card winning" : "card"}>
                        <div className="staking_subtitle">
                            Green
                        </div>
                        <div style={{ overflow: "auto", maxHeight: "200px", minHeight: "150px" }}>
                            {green_items.map((item: { wallet: string; amount: number }, index: number) => {
                                <div className="staking_stat-row" key={index}>{formatAddress(item.wallet, 4)} + ":" + {item.amount}</div>
                            })}
                        </div>
                    </div> */}

                    <Status items={blue_items} bgColor="#5eceff" color="blue" />
                    <Status items={same_items} bgColor="#007BFF" color="same" />
                    <Status items={green_items} bgColor="#77eb1f" color="green" />

                </div>
                {/* <div className="creepz-layout-wrapper">
                    <div className="spin-box">
                        <Spinner type={"large"} />
                    </div>
                </div> */}
            </div>
        </div>
        <div className="staking_bottons-wrapper">
            <div className="popup__button stake__button" onClick={() => handleBetBlue()}>
                <span>Bet Blue</span>
            </div>
            <div className="popup__button claim__button" onClick={() => handleBetSame()}>
                <span>Bet Same</span>
            </div>
            <div className="popup__button claim__button" onClick={() => handleBetGreen()}>
                <span>Bet Green</span>
            </div>
        </div>

        {/* <div className="overlay" id="modal-stake-result">
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
        </div> */}
    </>)
}

export default Betting;