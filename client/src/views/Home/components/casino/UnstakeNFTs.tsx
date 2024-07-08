import { useEffect, useState } from "react"
import useTWMFinance from "../../../../hooks/useTWMFinance";
import { NftInfo, ReturnInfo } from "../../../../twm-finance/types";
import ItemNFT from "./ItemNFT";
import Spinner from "../Spinner";
import Ok from "../../../../assets/pixelwork/check-ok.png";
import Fail from "../../../../assets/pixelwork/check-fail.png";

function UnstakeNFTs() {
    const twmFinance = useTWMFinance();
    const types = ['V1', 'V2'];
    const tabClassNames = ['staking-menu-item', 'staking-menu-item active']
    const [tabStakeActive, setTabStakeActive] = useState(types[0]);
    const [stakedTWMs, setStakedTWMs] = useState<NftInfo[]>([]);
    const [stakedUtilities, setStakedUtilities] = useState<NftInfo[]>([]);
    const [selectedStakedTWMIndexes, setSelectedStakedTWMIndexes] = useState<number[]>([]);
    const [selectedStakedUtilityIndexes, setSelectedStakedUtilityIndexes] = useState<number[]>([]);
    const [changed, setChange] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isStaking, setIsStaking] = useState(false);
    const [isSelectAllV1, setIsSelectAllV1] = useState(false);
    const [isSelectAllV2, setIsSelectAllV2] = useState(false);
    const [isUnselectAllV1, setIsUnselectAllV1] = useState(false);
    const [isUnselectAllV2, setIsUnselectAllV2] = useState(false);

    const [result, setResult] = useState<ReturnInfo>({
        success: true,
        reason: "",
    });

    useEffect(() => {
        async function fetchInfo() {
            try {
                setIsLoading(true);
                if (twmFinance?.myAccount) {
                    setSelectedStakedTWMIndexes([])
                    setSelectedStakedUtilityIndexes([])
                    setStakedTWMs(await twmFinance.fetchStakedTWMs());
                    setStakedUtilities(await twmFinance.fetchStakedUtilities());
                    setSelectedStakedTWMIndexes([]);
                    setSelectedStakedUtilityIndexes([]);
                    setIsSelectAllV1(false);
                    setIsSelectAllV2(false);
                    setIsUnselectAllV1(false);
                    setIsUnselectAllV2(false);
                }
                setIsLoading(false);
            } catch (error) {
                if (isLoading) {
                    setIsLoading(false);
                }
                setIsSelectAllV1(false);
                setIsSelectAllV2(false);
                setIsUnselectAllV1(false);
                setIsUnselectAllV2(false);
                console.error(error);
            }
        }

        fetchInfo();
    }, [twmFinance?.myAccount, changed])

    const render = () => {
        setChange(!changed);
    };

    const confirmUnstake = async () => {
        setIsStaking(true);
        let res;
        if (tabStakeActive === types[0]) {
            res = await twmFinance?.withdraw(selectedStakedTWMIndexes);
        } else {
            res = await twmFinance?.withdrawUtility(selectedStakedUtilityIndexes);
        }

        if (res) {
            setResult(res);
            if (res.success) {
                render();
            }
        }

        // setSelectedStakedTWMIndexes([])
        // setSelectedStakedUtilityIndexes([])

        document.getElementById("modal-unstake-result")?.classList.add("open");

        document
            .getElementById("modal-unstake-result")
            ?.addEventListener("click", function () {
                document.getElementById("modal-unstake-result")?.classList.remove("open");
            });

        setIsStaking(false);
    }

    const handleAllSelect = () => {
        if (tabStakeActive === types[0]) {
            setIsUnselectAllV1(false);
            setIsSelectAllV1(true);
            let allV1IDs = stakedTWMs.map((twm) =>
                twm.id
            );
            setSelectedStakedTWMIndexes(allV1IDs)
        } else {
            setIsUnselectAllV2(false);
            setIsSelectAllV2(true);
            let allV2IDs = stakedUtilities.map((twm) =>
                twm.id
            );
            setSelectedStakedUtilityIndexes(allV2IDs)
        }
    }

    const handleAllUnselect = () => {
        if (tabStakeActive === types[0]) {
            setIsSelectAllV1(false);
            setIsUnselectAllV1(true);
            setSelectedStakedTWMIndexes([])
        } else {
            setIsSelectAllV2(false);
            setIsUnselectAllV2(true);
            setSelectedStakedUtilityIndexes([])
        }
    }

    const handleCancelAllSelectV1 = () => {
        setIsSelectAllV1(false);
    }

    const handleCancelAllSelectV2 = () => {
        setIsSelectAllV2(false);
    }

    const handleCancelAllUnselectV1 = () => {
        setIsUnselectAllV1(false);
    }

    const handleCancelAllUnselectV2 = () => {
        setIsUnselectAllV2(false);
    }

    const handleTab = (type: string) => {
        if (!isStaking) {
            setTabStakeActive(type);
        }
    }



    return (<>
        <div className="popup__panel-wrapper">
            <div className="staking_container">
                <div className="tabs-menu-wrapper">
                    <div className={tabStakeActive === types[0] ? tabClassNames[1] : tabClassNames[0]} onClick={() => { handleTab(types[0]) }}>V1</div>
                    <div className={tabStakeActive === types[0] ? tabClassNames[0] : tabClassNames[1]} onClick={() => { handleTab(types[1]) }}>V2</div>
                </div>
                {/* <div style={{ textAlign: "center", width: "100%" }}>Utility cannot be staked alone</div> */}
                <div className="creepz-layout-wrapper">
                    {isLoading ? (
                        <div className="spin-box">
                            <Spinner type={"large"} />
                        </div>
                    ) : (
                        tabStakeActive === types[0] ? (<>
                            {stakedTWMs.map((nft, idx) => {
                                return (
                                    <ItemNFT
                                        key={idx + nft.id * 10}
                                        index={nft.id}
                                        nftData={nft}
                                        indexes={selectedStakedTWMIndexes}
                                        changeIndexes={setSelectedStakedTWMIndexes}
                                        isSelectingAll={isSelectAllV1}
                                        isUnselectingAll={isUnselectAllV1}
                                        CancelAllSelect={handleCancelAllSelectV1}
                                        CancelAllUnselect={handleCancelAllUnselectV1}
                                    />
                                );
                            })}
                        </>) : (<>
                            {stakedUtilities.map((nft, idx) => {
                                return (
                                    <ItemNFT
                                        key={idx + nft.id * 10 + 10000}
                                        index={nft.id}
                                        nftData={nft}
                                        indexes={selectedStakedUtilityIndexes}
                                        changeIndexes={setSelectedStakedUtilityIndexes}
                                        isSelectingAll={isSelectAllV2}
                                        sUnselectingAll={isUnselectAllV2}
                                        CancelAllSelect={handleCancelAllSelectV2}
                                        CancelAllUnselect={handleCancelAllUnselectV2}
                                    />
                                );
                            })}
                        </>)
                    )}

                </div>
            </div>
        </div>
        <div className="staking_bottons-wrapper">
            {!isStaking ? (
                <>
                    <div className="popup__button unstake__button" onClick={() => confirmUnstake()}>
                        <span>Confirm Unstake</span>
                    </div>
                    <div className="popup__button claim__button" onClick={() => handleAllSelect()}>
                        <span>Select All</span>
                    </div>
                    <div className="popup__button claim__button" onClick={() => handleAllUnselect()}>
                        <span>Unselect All</span>
                    </div>
                </>
            ) : (
                <div className="popup__button stake__button" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Spinner type={"small"} />
                </div>
            )}
        </div>
        <div className="overlay" id="modal-unstake-result">
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
    </>)
}

export default UnstakeNFTs;