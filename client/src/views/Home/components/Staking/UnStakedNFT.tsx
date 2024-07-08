function UnStakedNFT(props: any) {
  const changeHandler = (e: any, index: number) => {
    let indexes = [...props.indexes];
    if (e.target.checked) {
      indexes.push(index);
      props.changeIndexes(indexes);
    } else {
      const newIndexes = indexes.filter((item, _) => item !== index);
      props.changeIndexes(newIndexes);
    }
  };

  return (
    <section className="defi-item">
      <div className="row">
        <div className="col-xl-12">
          <div className="row defi-item-row">
            <div className="col-xl-12 col-lg-12">
              <div className="defi-box">
                <div className="defi-box-header">
                  <div className="defi-box-left">
                    <div className="defi-box-img">
                      <img
                        src={props.nftData.imageUrl}
                        className="defi-img-4"
                      ></img>
                    </div>
                  </div>
                </div>
                <div className="defi-box-row">
                  <div className="defi-box-id">{props.nftData.name}</div>
                </div>
                <div className="defi-mark-row">
                  <div className="defi-mark">
                    <span className="defi-mark-id text-bold">
                      {props.nftData.normalReward} $TWMT / DAY
                    </span>
                  </div>
                  <input
                    onChange={(e) => changeHandler(e, props.index)}
                    type="checkbox"
                    className="defi-item-checkbox"
                    aria-label="Checkbox for following text input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UnStakedNFT;
