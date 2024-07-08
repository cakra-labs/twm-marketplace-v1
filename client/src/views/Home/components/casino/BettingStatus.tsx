import { useEffect, useState } from "react"
import useTWMFinance from "../../../../hooks/useTWMFinance";
import usePersonalInfo from "../../../../hooks/usePersonalInfo";
import useSocket from "../../../../hooks/useSocket";
import { NftInfo } from "../../../../twm-finance/types";
import formatAddress from "../../../../utils/formatAddress";
import Rolling from "./Rolling";

function BettingStatus() {
    const twmFinance = useTWMFinance();
    const [stakedAll, setStakedAll] = useState<number>(0);
    const [unstakedAll, setUnstakedAll] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [stakedTWMs, setStakedTWMs] = useState<NftInfo[]>([]);
    const [stakedUtilities, setStakedUtilities] = useState<NftInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [balanceTWMT, setBalanceTWMT] = useState<string>("0");
    const [stakerYield, setStakerYield] = useState<string>("0");

    const { fund, betColor, bettingFlag, winColor } = usePersonalInfo();
    const curSocket = useSocket();
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


    const fetchTWMTBalance = async () => {
        const res = await twmFinance?.fetchTWMTBalance();
        if (res) {
            setBalanceTWMT(res.split(".")[0]);
        }
    };

    const fetchStakerYield = async () => {
        const res = await twmFinance?.fetchTWMTDailyYield();
        if (res) {
            setStakerYield(res.split(".")[0]);
        }
    };


    useEffect(() => {
        async function fetchInfo() {
            try {
                setIsLoading(true);
                if (twmFinance?.myAccount) {
                    let resStakedAll = await twmFinance.fetchStakedAllAmount();
                    setStakedAll(resStakedAll);
                    let resUnstakedAll = await twmFinance.fetchUnstakedAllAmount();
                    setUnstakedAll(resUnstakedAll);
                    setTotal(resStakedAll + resUnstakedAll);
                    setStakedTWMs(await twmFinance.fetchStakedTWMs());
                    setStakedUtilities(await twmFinance.fetchStakedUtilities());
                    fetchTWMTBalance();
                    fetchStakerYield();
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
    }, [twmFinance?.myAccount])


    function Status(props: {
        items: [{ wallet: string; amount: number }];
        bgColor: string;
        color: string;
    }): JSX.Element {
        return (<>
            <div className={winColor === props.color ? "card winning" : "card"}>
                <div className="staking_subtitle">
                    {props.color} ({props.items.length})
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
            <div className="staking_container">
                <div className="staking-title">Casino Game Introduction</div>
                <div className="dash_line dash_line_staking"></div>
                <div className="staking-stat-wrapper">
                    <div className="card" style={{ width: "100%" }}>
                        <div className="staking_subtitle">
                            Select which dice will roll the higher number.
                            <br />
                            Select the center option if you think they will land on the same
                            number for a chance to 5x your bet.
                        </div>
                    </div>
                </div>
                <div className="" style={{ color: "", margin: "20px" }}></div>
                <div className="staking-title">Rolling Status</div>
                <div className="dash_line dash_line_staking"></div>
                <div className="rolling-stat-wrapper">
                    <Status items={blue_items} bgColor="#5eceff" color="blue" />
                    <Status items={same_items} bgColor="#007BFF" color="same" />
                    <Status items={green_items} bgColor="#77eb1f" color="green" />
                </div>
            </div>
        </div>
    </>)
}

export default BettingStatus;