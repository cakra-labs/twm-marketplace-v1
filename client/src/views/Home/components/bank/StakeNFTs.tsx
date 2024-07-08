import { useEffect, useState } from "react"
import useTWMFinance from "../../../../hooks/useTWMFinance";
import { NftInfo, ReturnInfo } from "../../../../twm-finance/types";
import ItemNFT from "./ItemNFT";
import Spinner from "../Spinner";
import Ok from "../../../../assets/pixelwork/check-ok.png";
import Fail from "../../../../assets/pixelwork/check-fail.png";

function StakeNFTs() {
    const twmFinance = useTWMFinance();
    const types = ['V1', 'V2'];
    const tabClassNames = ['staking-menu-item', 'staking-menu-item active']
    const [tabStakeActive, setTabStakeActive] = useState(types[0]);
    const [unstakedTWMs, setUnstakedTWMs] = useState<NftInfo[]>([]);
    const [unstakedUtilities, setUnstakedUtilities] = useState<NftInfo[]>([]);
    const [selectedUnstakedTWMIndexes, setSelectedUnstakedTWMIndexes] = useState<number[]>([]);
    const [selectedUnstakedUtilityIndexes, setSelectedUnstakedUtilityIndexes] = useState<number[]>([]);
    const [isTWMApproveAll, setIsTWMApproveAll] = useState(false);
    const [isUtilityApproveAll, setIsUtilityApproveAll] = useState(false);
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
                    setSelectedUnstakedTWMIndexes([])
                    setSelectedUnstakedUtilityIndexes([])
                    setIsTWMApproveAll(await twmFinance.isApprovedForAll(twmFinance.myAccount));
                    setIsUtilityApproveAll(await twmFinance.isApprovedForAllUtility(twmFinance.myAccount));
                    setUnstakedTWMs(await twmFinance.fetchUnstakedTWMs());
                    setUnstakedUtilities(await twmFinance.fetchUnstakedUtilities());
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

    const confirmStake = async () => {
        setIsStaking(true);
        let res;
        if (tabStakeActive === types[0]) {
            res = await twmFinance?.depositNFTs(selectedUnstakedTWMIndexes);
        } else {
            res = await twmFinance?.depositUtilities(selectedUnstakedUtilityIndexes);
        }

        if (res) {
            setResult(res);
            if (res.success) {
                render();
            }
        }

        // setSelectedUnstakedTWMIndexes([])
        // setSelectedUnstakedUtilityIndexes([])

        document.getElementById("modal-stake-result")?.classList.add("open");

        document
            .getElementById("modal-stake-result")
            ?.addEventListener("click", function () {
                document.getElementById("modal-stake-result")?.classList.remove("open");
            });

        setIsStaking(false);
    }

    const handleAllSelect = () => {
        if (tabStakeActive === types[0]) {
            setIsUnselectAllV1(false);
            setIsSelectAllV1(true);
            let allV1IDs = unstakedTWMs.map((twm) =>
                twm.id
            );
            setSelectedUnstakedTWMIndexes(allV1IDs)
        } else {
            setIsUnselectAllV2(false);
            setIsSelectAllV2(true);
            let allV2IDs = unstakedUtilities.map((twm) =>
                twm.id
            );
            setSelectedUnstakedUtilityIndexes(allV2IDs)
        }
    }

    const handleAllUnselect = () => {
        if (tabStakeActive === types[0]) {
            setIsSelectAllV1(false);
            setIsUnselectAllV1(true);
            setSelectedUnstakedTWMIndexes([])
        } else {
            setIsSelectAllV2(false);
            setIsUnselectAllV2(true);
            setSelectedUnstakedUtilityIndexes([])
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

    const handleApprove = async () => {
        setIsStaking(true);
        setSelectedUnstakedTWMIndexes([])
        setSelectedUnstakedUtilityIndexes([])
        let res;
        if (tabStakeActive === types[0]) {
            res = await twmFinance?.setApproveForAll();
        } else {
            res = await twmFinance?.setApproveForAllUtility();
        }
        if (res) {
            setResult(res);
            if (res.success) {
                render();
            }
        }

        document.getElementById("modal-stake-result")?.classList.add("open");

        document
            .getElementById("modal-stake-result")
            ?.addEventListener("click", function () {
                document.getElementById("modal-stake-result")?.classList.remove("open");
            });
        setIsStaking(false);
    }

    const handleTab = (type: string) => {
        if (!isStaking) {
            setTabStakeActive(type);
        }
    }

    const handleSelectPopup = () => {
        if (tabStakeActive) {
            setIsTWMApproveAll(false);
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
                            {unstakedTWMs.map((nft, idx) => {
                                return (
                                    <ItemNFT
                                        key={idx + nft.id * 10000}
                                        index={nft.id}
                                        nftData={nft}
                                        indexes={selectedUnstakedTWMIndexes}
                                        changeIndexes={setSelectedUnstakedTWMIndexes}
                                        isSelectingAll={isSelectAllV1}
                                        isUnselectingAll={isUnselectAllV1}
                                        CancelAllSelect={handleCancelAllSelectV1}
                                        CancelAllUnselect={handleCancelAllUnselectV1}
                                    />
                                );
                            })}
                        </>) : (<>
                            {unstakedUtilities.map((nft, idx) => {
                                return (
                                    <ItemNFT
                                        key={idx + nft.id * 10000 + 100000000}
                                        index={nft.id}
                                        nftData={nft}
                                        indexes={selectedUnstakedUtilityIndexes}
                                        changeIndexes={setSelectedUnstakedUtilityIndexes}
                                        isSelectingAll={isSelectAllV2}
                                        isUnselectingAll={isUnselectAllV2}
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
                tabStakeActive === types[0] ?
                    (
                        isTWMApproveAll ?
                            (<>
                                <div className="popup__button stake__button" onClick={async () => await confirmStake()}>
                                    <span>Confirm Stake</span>
                                </div>
                                <div className="popup__button claim__button" onClick={() => handleAllSelect()}>
                                    <span>Select All</span>
                                </div>
                                <div className="popup__button claim__button" onClick={() => handleAllUnselect()}>
                                    <span>Unselect All</span>
                                </div>
                            </>) : (<>
                                <div className="popup__button stake__button" onClick={async () => await handleApprove()}>
                                    <span>Approve</span>
                                </div>
                            </>)
                    )
                    : (
                        isUtilityApproveAll ?
                            (<>
                                <div className="popup__button stake__button" onClick={async () => await confirmStake()}>
                                    <span>Confirm Stake</span>

                                </div>
                                <div className="popup__button claim__button" onClick={() => handleAllSelect()}>
                                    <span>Select All</span>
                                </div>
                                <div className="popup__button claim__button" onClick={() => handleAllUnselect()}>
                                    <span>Unselect All</span>
                                </div>
                            </>) : (<>
                                <div className="popup__button stake__button" onClick={async () => await handleApprove()}>
                                    <span>Approve</span>
                                </div>
                            </>)
                    )
            ) : (
                <div className="popup__button stake__button" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Spinner type={"small"} />
                </div>
            )}

        </div>
        <div className="overlay" id="modal-stake-result">
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

export default StakeNFTs;