import React, { PureComponent } from 'react';
import styled, { css } from 'styled-components';
import {
  EVENT_DIRECTORIES_ANALYSES_COMPLETE,
  EVENT_DIRECTORY_ANALYSIS_COMPLETE,
  EVENT_PICTURE_METADATA_COMPLETE,
  EVENT_PICTURE_METADATA_ERROR,
  EVENT_CACHE_BUILDING_COMPLETE,
  EVENT_THUMBNAIL_CREATION_COMPLETE,
  EVENT_THUMBNAILS_CREATION_COMPLETE
} from '../system/library';

const _Root = styled.div`
  color: white;
  font-size: 200%;
  height: 100%;
  margin-top: 111px;
  text-align: center;
  width: 100%;

  * {
    margin: 0;
    padding: 0;
  }

  ul {
    list-style-type: none;
  }
`;

const _Section = styled.p`
  margin-top: 20px;
  text-transform: uppercase;
`;

const _WaitIcon = styled.i`
  @keyframes hop {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  animation: hop 1s ease infinite alternate;
  margin-bottom: 20px;
`;

const _WaitIconDir = styled.i`
  @keyframes hop {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  animation: hop 250ms ease infinite alternate;
`;

const _File = styled.p`
  font-family: monospace;
  font-size: 50%;
  margin: 0 100px;
`;

export default class extends PureComponent {
  constructor(props) {
    super(props);

    this.picturesMetadataCollected = 0;
    this.thumbnailsCreated = 0;

    this.state = {
      currentDirectory: null,
      currentFile: null,
      distinctPicturesFound: 0,
      picturesFound: 0,
      picturesMetadataCollectedProgress: 0,
      thumbnailsCreationProgress: 0,
      picturesMetadataErrors: [],
      thumbnailsGenerated: false
    };

    this.props.loadingEventEmitter.on(EVENT_DIRECTORIES_ANALYSES_COMPLETE, _ => {
      this.setState({
        picturesFound: _
      });
    });

    this.props.loadingEventEmitter.on(EVENT_PICTURE_METADATA_COMPLETE, _ => {
      this.picturesMetadataCollected++;
      this.setState({
        picturesMetadataCollectedProgress: Math.round(
          100 * (this.picturesMetadataCollected / this.state.picturesFound).toFixed(2)
        )
      });
    });

    this.props.loadingEventEmitter.on(EVENT_PICTURE_METADATA_ERROR, (_, e) => {
      this.setState({ picturesMetadataErrors: [_, ...this.state.picturesMetadataErrors] });
    });

    this.props.loadingEventEmitter.on(EVENT_CACHE_BUILDING_COMPLETE, _ => {
      this.setState({ distinctPicturesFound: _.length });
    });

    this.props.loadingEventEmitter.on(EVENT_THUMBNAIL_CREATION_COMPLETE, () => {
      this.thumbnailsCreated++;
      this.setState({
        thumbnailsCreationProgress: Math.round(
          100 * (this.thumbnailsCreated / this.state.distinctPicturesFound).toFixed(2)
        )
      });
    });

    this.props.loadingEventEmitter.on(EVENT_THUMBNAILS_CREATION_COMPLETE, () => {
      this.setState({ thumbnailsGenerated: true });
    });
  }

  render() {
    return (
      <_Root>
        <_WaitIcon className="fa fa-tree" aria-hidden="true" />
        <_Section>Please wait...</_Section>
        <_Section>Loading pictures from directories:</_Section>
        <ul>
          {this.props.directories.map(_ => (
            <li key={_}>
              <_File>{_}</_File>
            </li>
          ))}
        </ul>
        <_Section>
          Pictures found:{' '}
          {this.state.picturesFound || <_WaitIconDir className="fa fa-hourglass-o" aria-hidden="true" />}
        </_Section>
        <_Section>
          Collecting metadata:{' '}
          {this.state.picturesMetadataCollectedProgress ? (
            `${this.state.picturesMetadataCollectedProgress}%`
          ) : (
            <_WaitIconDir className="fa fa-hourglass-o" aria-hidden="true" />
          )}
        </_Section>
        <_Section>
          Distinct pictures:{' '}
          {this.state.distinctPicturesFound || <_WaitIconDir className="fa fa-hourglass-o" aria-hidden="true" />}
        </_Section>
        <_Section>
          Thumbnails generation:{' '}
          {this.state.thumbnailsCreationProgress ? (
            `${this.state.thumbnailsCreationProgress}%`
          ) : (
            <_WaitIconDir className="fa fa-hourglass-o" aria-hidden="true" />
          )}
        </_Section>
      </_Root>
    );
  }
}
