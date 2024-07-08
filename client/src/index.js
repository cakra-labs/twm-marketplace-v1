import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { Route, Switch } from 'react-router'
import { history } from './store/configureStore'
import store from './store/configureStore'
import Admin from './layouts/Admin'
import './assets/sass/style.scss';

import $ from 'jquery';

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/" component={Admin} />
      </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
)
let hamburgerButton = document.querySelector('.hamburger');
hamburgerButton.addEventListener('click', () => {
  document.querySelector('nav').classList.toggle('mobile-open');
});
$(document).ready(function () {
  $('.menu .menu-item a').click(function () {
    $('.menu .menu-item a').removeClass('active');
    $(this).addClass('active');
  })
});
$(window).on("load", function () {
  if (window.location.hash) {
    $("html, body").animate({
      scrollTop: $(window.location.hash).offset().top
    }, 'fast');
  }
});