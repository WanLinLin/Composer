import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {users: []};

  render() {
    return (
      <div className="App">
        <LyricForm />
      </div>
    );
  }
}

class LyricForm extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }


  handleClick = () => {
    fetch('https://localhost:3001/lyric/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rhyme: 'ㄞ',
        wordNum: '2',
        inputSentence: '你說你'
      })
    })
    .then(res => res.json())
    .then(lyrics => console.log(lyrics));
  }

  render() {
    return (
      <form method="POST" action="https://localhost:3001/lyric">
        <input type="text" placeholder="請輸入句子" name="inputSentence" />
        <select name="wordNum">
          <option value="1"> 1個字</option>
          <option value="2" selected> 2個字</option>
          <option value="3"> 3個字</option>
          <option value="4"> 4個字</option>
          <option value="5"> 5個字</option>
        </select>
        <select name="rhyme">
          <option value="ㄓ" selected> ㄓ韻</option>
          <option value="ㄔ"> ㄔ韻</option>
          <option value="ㄕ"> ㄕ韻</option>
          <option value="ㄖ"> ㄖ韻</option>
          <option value="ㄗ"> ㄗ韻</option>
          <option value="ㄘ"> ㄘ韻</option>
          <option value="ㄙ"> ㄙ韻</option>
          <option value="ㄧ"> ㄧ韻</option>
          <option value="ㄨ"> ㄨ韻</option>
          <option value="ㄩ"> ㄩ韻</option>
          <option value="ㄚ"> ㄚ韻</option>
          <option value="ㄛ"> ㄛ韻</option>
          <option value="ㄜ"> ㄜ韻</option>
          <option value="ㄝ"> ㄝ韻</option>
          <option value="ㄞ"> ㄞ韻</option>
          <option value="ㄟ"> ㄟ韻</option>
          <option value="ㄠ"> ㄠ韻</option>
          <option value="ㄡ"> ㄡ韻</option>
          <option value="ㄢ"> ㄢ韻</option>
          <option value="ㄣ"> ㄣ韻</option>
          <option value="ㄤ"> ㄤ韻</option>
          <option value="ㄥ"> ㄥ韻</option>
          <option value="ㄦ"> ㄦ韻</option>
        </select>
        <input type="submit" value="推薦" />
      </form>
    );
  }

}

// class LyricList extends Component {

// }

export default App;
