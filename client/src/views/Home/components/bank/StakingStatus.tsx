import { useEffect, useState } from "react"
import useTWMFinance from "../../../../hooks/useTWMFinance";
import { NftInfo } from "../../../../twm-finance/types";
import Spinner from "../Spinner";

function StakingStatus() {
    const twmFinance = useTWMFinance();
    const [stakedAll, setStakedAll] = useState<number>(0);
    const [unstakedAll, setUnstakedAll] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [stakedTWMs, setStakedTWMs] = useState<NftInfo[]>([]);
    const [stakedUtilities, setStakedUtilities] = useState<NftInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [balanceTWMT, setBalanceTWMT] = useState<string>("0");
    const [stakerYield, setStakerYield] = useState<string>("0");

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

    return (<>
        <div className="popup__panel-wrapper">
            <div className="staking_container">
                <div className="staking-title">The WatchMaker Staking Control</div>
                <div className="dash_line dash_line_staking"></div>
                <div className="staking-stat-wrapper">
                    <div className="card">
                        <div className="staking_subtitle">
                            Staked
                        </div>
                        <div className="details-input">{stakedAll}</div>
                    </div>
                    <div className="card">
                        <div className="staking_subtitle">
                            Unstaked
                        </div>
                        <div className="details-input">{unstakedAll}</div>
                    </div>
                    <div className="card">
                        <div className="staking_subtitle">
                            Total
                        </div>
                        <div className="details-input">{total}</div>
                    </div>
                    <div className="card">
                        <div className="staking_subtitle">
                            $TWMT balance
                        </div>
                        <div className="details-input">{balanceTWMT}</div>
                    </div>
                    <div className="card">
                        <div className="staking_subtitle">
                            Yield per day
                        </div>
                        <div className="details-input">{stakerYield}</div>
                    </div>
                </div>

                <div className="" style={{ color: "", margin: "20px" }}></div>

                <div style={{ color: "rgb(141, 255, 31)", margin: "20px 0px -10px", textAlign: "center" }}>Your staked TWM V1 & V2 are displayed here.</div>

                <div className="staking-title">Staked TWM V1 & V2</div>

                <div className="dash_line dash_line_staking"></div>

                <div className="creepz-layout-wrapper">
                    {isLoading ?
                        (
                            <div className="spin-box">
                                <Spinner type={"large"} />
                            </div>
                        ) : (
                            <>
                                {
                                    stakedTWMs.map((nft, index) => {
                                        return (
                                            <div className="creep-item" key={index}>
                                                <img src={nft.imageUrl} alt="WatchParts Icon" />
                                                <p className="yield_subtitle">{nft.normalReward}</p>
                                            </div>
                                        )
                                    })
                                }
                                
                                {
                                    stakedUtilities.map((nft, index) => {
                                        return (
                                            <div className="creep-item" key={index}>
                                                <img src={nft.imageUrl} alt="WatchParts Icon" />
                                                <p className="yield_subtitle">{nft.normalReward}</p>
                                            </div>
                                        )
                                    })
                                }
                            </>
                        )
                    }
                </div>

            </div>
        </div>
    </>)
}

export default StakingStatus;