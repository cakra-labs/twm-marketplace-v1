import LogoHeader from '../../../assets/pixelwork/logo.png';

function Header() {
  return (
    <header id="home">
        <div className="header-animation">
            <video autoPlay muted loop>
                <source src="video/header.mp4" type="video/mp4" />
                <source src="video/header.webm" type="video/webm" />
            </video>
        </div>
        <div className="container">
            <div className="row">
                <div className="col-xl-12 header-content">
                    <a href="#">
                        <img src={LogoHeader} alt="Invokers" />
                        <div className="header-logo">
                            <video autoPlay muted loop>
                                <source src="video/invokers-logo-defi_VP8.webm" type="video/webm" />
                            </video>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </header>
  )
}

export default Header