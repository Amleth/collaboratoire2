import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Route, Link } from 'react-router-dom';
import styled from 'styled-components';

import { NAV_SIZE, MAIN_NAV_BG, MAIN_NAV_FG, MAIN_NAV_FG_OVER } from './constants';
import Home from './Home';
import Library from '../containers/Library';
import Image from '../containers/Image';
import Data from '../containers/Data';

const _Root = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const _Main = styled.main`
  height: 100%;
  width: 100%;
`;

const _Nav = styled.nav`
  background-color: ${MAIN_NAV_BG};
  display: flex;
  flex-direction: column;
  height: 100%;
  width: ${NAV_SIZE}px;
`;

const _Link = styled(Link)`
  color: ${MAIN_NAV_FG};
  display: block;
  line-height: ${NAV_SIZE}px;
  padding-top: 12px;
  text-align: center;
  transition: color 500ms ease;
  width: ${NAV_SIZE}px;

  &:hover {
    color: ${MAIN_NAV_FG_OVER};
    transition: color 250ms ease;
  }
`;

const _LinkSymbol = styled.i`font-size: 130% !important;`;

export default class App extends Component {
  render() {
    return (
      <_Root>
        <_Main>{this.props.children}</_Main>
        <_Nav>
          {/* <_Link to="/">
            <_LinkSymbol className="fa fa-home" aria-hidden="true" />
          </_Link> */}
          <_Link to="/library">
            <_LinkSymbol className="fa fa-cubes" aria-hidden="true" />
          </_Link>
          <_Link to="/image">
            <_LinkSymbol className="fa fa-picture-o" aria-hidden="true" />
          </_Link>
          <_Link to="/data">
            <_LinkSymbol className="fa fa-list" aria-hidden="true" />
          </_Link>
        </_Nav>
      </_Root>
    );
  }
}
