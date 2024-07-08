import { useEffect, useState } from "react"
import GreyLight from "../../../../assets/twm/grey-light.svg"
import GreyGreenLight from "../../../../assets/twm/grey-green-light.svg"

function ItemNFT(props: any) {
    const [isSelected, setIsSelected] = useState(false);

    useEffect(() => {
        if(props.indexes.includes(props.index)) {
            setIsSelected(true)
        } else {
            setIsSelected(false)
        }
    }, [])

    useEffect(() => {
        if (props.isSelectingAll) {
            setIsSelected(true)
        }
        if (props.isUnselectingAll) {
            setIsSelected(false)
        }
    }, [props.isSelectingAll, props.isUnselectingAll])

    const changeHandler = (index: number) => {
        let indexes = [...props.indexes];
        if (!isSelected) {
            indexes.push(index);
            props.changeIndexes(indexes);
            setIsSelected(true);
            if (props.isUnselectingAll) {
                props.CancelAllUnselect();
            }
        } else {
            if (props.isSelectingAll) {
                props.CancelAllSelect();
            }
            const newIndexes = indexes.filter((item, _) => item !== index);
            props.changeIndexes(newIndexes);
            setIsSelected(false);
        }
    };

    return (<>
        <div className="creep-item" onClick={() => changeHandler(props.index)}>
            <img src={props.nftData.imageUrl} alt="TWM Icon" />
            <div className="staking_icon">
                <img src={isSelected ? GreyGreenLight : GreyLight} style={{ width: "100%" }} />
            </div>
            <p className="yield_subtitle">{props.nftData.normalReward}</p>
        </div>

    </>)
}

export default ItemNFT;