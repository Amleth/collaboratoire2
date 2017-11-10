import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const _MainContainer = styled.div`
  height: 100%;
  padding: 33px;
  width: 100%;
`;

const _InnerContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export default ({}) => (
  <_MainContainer>
    <_InnerContainer />
  </_MainContainer>
);
