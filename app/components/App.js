import { remote } from 'electron';
import fs from 'fs-extra';
import path from 'path';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Route, Link } from 'react-router-dom';
import styled from 'styled-components';

import { NAV_SIZE, MAIN_NAV_BG, MAIN_NAV_FG, MAIN_NAV_FG_OVER } from './constants';
import Home from './Home';
import Library from '../containers/Library';
import Image from '../containers/Image';
import Data from '../containers/Data';
import { store } from '../index';
import { userDataBranches } from '../reducers/app';

const _Root = styled.div`
  background-color: white;
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

const _LinkSymbol = styled.i`
  font-size: 130% !important;
`;

const _Icon = styled.div`
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

export default class App extends Component {
  open = () => {
    let file = remote.dialog.showOpenDialog();
    if (!file || file.length < 1) return;
    file = file.pop();

    try {
      const content = JSON.parse(fs.readFileSync(file, 'utf8'));
      for (const _ in userDataBranches()) {
        store.getState()['app'][_] = content.userdata[_];
      }
    } catch (e) {
      remote.dialog.showErrorBox('Argh', 'Invalid file');
    }
  };

  save = () => {
    let file = remote.dialog.showSaveDialog();
    if (!file || file.length < 1) return;

    const content = { userdata: {} };
    for (const _ in userDataBranches()) {
      content.userdata[_] = store.getState()['app'][_];
    }
    content.date = new Date();
    fs.writeFileSync(file, JSON.stringify(content));
  };

  render() {
    return (
      <_Root>
        <_Main>{this.props.children}</_Main>
        <_Nav>
          <_Icon onClick={this.save}>
            <_LinkSymbol className="fa fa-save" aria-hidden="true" />
          </_Icon>
          <_Icon onClick={this.open}>
            <_LinkSymbol className="fa fa-folder-open" aria-hidden="true" />
          </_Icon>
          <_Link to="/">
            <_LinkSymbol className="fa fa-home" aria-hidden="true" />
          </_Link>
          <_Link to="/library">
            <_LinkSymbol className="fa fa-cubes" aria-hidden="true" />
          </_Link>
          <_Link to="/image">
            <_LinkSymbol className="fa fa-picture-o" aria-hidden="true" />
          </_Link>
          {/* <_Link to="/freespace">
            <_LinkSymbol className="fa fa-th" aria-hidden="true" />
          </_Link> */}
          <_Link to="/data">
            <_LinkSymbol className="fa fa-list" aria-hidden="true" />
          </_Link>
        </_Nav>
      </_Root>
    );
  }
}
