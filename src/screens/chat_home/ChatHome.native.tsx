import { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
} from 'react-native';

import SpeechAPI from '../../services/SpeechAPI';

type Props = {};
type State = {
  recognized: string;
  pitch: string;
  error: string;
  end: string;
  started: string;
  results: string[];
  partialResults: string[];
  recording: boolean;
};

class ChatHome extends Component<Props, State> {
  state = {
    recognized: '',
    pitch: '',
    error: '',
    end: '',
    started: '',
    results: [],
    partialResults: [],
    recording: false,
  };

  private resultListener: any;
  private errorListener: any;

  constructor(props: Props) {
    super(props);
    this.resultListener = SpeechAPI.addResultListener(this.onSpeechResults);
    this.errorListener = SpeechAPI.addErrorListener(this.onSpeechError);
  }

  componentWillUnmount() {
    if (this.resultListener) {
      this.resultListener.remove();
    }
    if (this.errorListener) {
      this.errorListener.remove();
    }
  }

  onSpeechStart = () => {
    console.log('onSpeechStart');
    this.setState({
      started: '√',
      recording: true,
    });
  };

  onSpeechEnd = () => {
    console.log('onSpeechEnd');
    this.setState({
      end: '√',
      recording: false,
    });
  };

  onSpeechError = (error: any) => {
    console.log('onSpeechError: ', error);
    this.setState({
      error: typeof error === 'string' ? error : JSON.stringify(error),
      recording: false,
    });
  };

  onSpeechResults = (result: any) => {
    console.log('onSpeechResults: ', result);
    let text = '';
    if (typeof result === 'string') {
      text = result;
    } else if (result && result.value) {
      text = result.value;
    } else if (result && result.length > 0) {
      text = result[0];
    }
    
    if (text) {
      this.setState({
        results: [text],
        recognized: '√',
      });
    }
  };

  _startRecognizing = async () => {
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
      recording: false,
    });

    try {
      this.onSpeechStart();
      await SpeechAPI.startListening();
    } catch (e) {
      console.error(e);
      this.onSpeechError(e);
    }
  };

  _stopRecognizing = async () => {
    try {
      await SpeechAPI.stopListening();
      this.onSpeechEnd();
    } catch (e) {
      console.error(e);
      this.onSpeechError(e);
    }
  };

  _cancelRecognizing = async () => {
    try {
      await SpeechAPI.stopListening();
      this.onSpeechEnd();
    } catch (e) {
      console.error(e);
      this.onSpeechError(e);
    }
  };

  _destroyRecognizer = async () => {
    try {
      await SpeechAPI.stopListening();
    } catch (e) {
      console.error(e);
    }
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
      recording: false,
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to Custom Speech Recognition!</Text>
        <Text style={styles.instructions}>
          Press the button and start speaking.
        </Text>
        <Text style={styles.stat}>{`Recording: ${this.state.recording ? 'Yes' : 'No'}`}</Text>
        <Text style={styles.stat}>{`Started: ${this.state.started}`}</Text>
        <Text style={styles.stat}>{`Recognized: ${
          this.state.recognized
        }`}</Text>
        <Text style={styles.stat}>{`Pitch: ${this.state.pitch}`}</Text>
        <Text style={styles.stat}>{`Error: ${this.state.error}`}</Text>
        <Text style={styles.stat}>Results</Text>
        {this.state.results.map((result, index) => {
          return (
            <Text style={styles.stat}>
              {result}
            </Text>
          );
        })}
        <Text style={styles.stat}>Partial Results</Text>
        {this.state.partialResults.map((result, index) => {
          return (
            <Text style={styles.stat}>
              {result}
            </Text>
          );
        })}
        <Text style={styles.stat}>{`End: ${this.state.end}`}</Text>
        <TouchableHighlight onPress={this._startRecognizing}>
        <Text style={styles.action}> Start Recording</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._stopRecognizing}>
          <Text style={styles.action}>Stop Recognizing</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._cancelRecognizing}>
          <Text style={styles.action}>Cancel</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._destroyRecognizer}>
          <Text style={styles.action}>Destroy</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  action: {
    textAlign: 'center',
    color: '#0000FF',
    marginVertical: 5,
    fontWeight: 'bold',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  stat: {
    textAlign: 'center',
    color: '#B0171F',
    marginBottom: 1,
  },
});

export default ChatHome;