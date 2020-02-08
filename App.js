import React from 'react';
import logo from './logo.svg';
import './App.css';

const authSpotifyEndpoint = "https://accounts.spotify.com/authorize";
const spotifyClientID = "272f739bef504990a24156738de12851";
const giphyClientID = "4FtJl4fUIkPLtF5LIQk2LvzzErv7Bq1W";
const redirectURL = "http://localhost:3000";
const scopes = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'streaming',
    'user-read-email',
    'user-read-private'
]
const hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce(function (acc, item) {
        let parts = item.split('=')
        acc[parts[0]] = parts[1]
        return acc
    }, {})

class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            spotifyAccessToken: null,
            spotifySoundKey: null,
            searchValue: null,
            giphyUrl: null
        }
    }

    componentDidMount() {
        let _token = hash.access_token
        if (_token) {
            this.setState({
                spotifyAccessToken: _token
            })
        }
    }

    renderLogin = () => (
        <div className='app-container'>
            <picture>
                <img className='logo' src={logo} />
            </picture>
            <a href={`${authSpotifyEndpoint}?client_id=${spotifyClientID}&redirect_uri=${redirectURL}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`}>
                Login
      </a>
        </div>
    )

    renderSearch = () => (
        <div className='app-container'>
            <picture>
                <img className='logo' src={logo} />
            </picture>
            <h1>Kodeparty</h1>
            <input
                onKeyDown={this.onKeyDownHandler}
                placeholder='Buscar'
            />
        </div>
    )

    renderResult = () => {
        const { spotifySoundKey, giphyUrl } = this.state
        return (
            <div className='app-container'>
                <h1>Encontramos...</h1>
                <iframe
                    src={
                        `https://embed.spotify.com?uri=spotify:track:${spotifySoundKey}`
                    }
                    width='400'
                    height='100'
                    frameBorder='0'
                    allow='encrypted-media'
                >
                </iframe>
                <picture>
                    <img src={giphyUrl} />
                </picture>
            </div>
        )

    }

    onKeyDownHandler = ({ key, target }) => {
        if (key === 'Enter') {
            console.log(key, target.value)
            this.setState({
                searchValue: target.value
            }, () => {
                this.fetchSearchWord(target.value)
            })
        }
    }

    fetchSearchWord = (word) => {
        const { spotifyAccessToken } = this.state
        fetch(
            `https://api.spotify.com/v1/search?q=${word}&type=track&limit=1`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${spotifyAccessToken}`
                }
            }
        )
            .then(response => response.json())
            .then(data => {
                this.setState({
                    spotifySoundKey: data.tracks.items[0].id
                })
            })

        fetch(
            `https://api.giphy.com/v1/gifs/search?api_key=${giphyClientID}&q=${word}&limit=1&rating=G&lang=es`
        )
            .then(response => response.json())
            .then(data => {
                let gifUrl = data.data[0].images.original.webp
                this.setState({
                    giphyUrl: gifUrl
                })
            })
    }

    render() {
        console.log(this.state)
        const { spotifyAccessToken, searchValue, spotifySoundKey, giphyUrl } = this.state
        return (
            <div className="App">
                {!spotifyAccessToken && this.renderLogin()}
                {spotifyAccessToken && !searchValue && this.renderSearch()}
                {
                    spotifyAccessToken &&
                    searchValue &&
                    spotifySoundKey &&
                    giphyUrl &&
                    this.renderResult()
                }
            </div>
        );
    }


}


export default App;