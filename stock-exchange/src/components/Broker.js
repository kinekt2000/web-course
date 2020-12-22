import React, {Component} from 'react'
import axios from 'axios'
import BrokerBlock from "./BrokerBlock";
import TableShares from "./TableShares";

import io from 'socket.io-client';

import "./styles/broker.css"
import TableBrokerShares from "./TableBrokerShares";
import DealBlock from "./DealBlock";

function mapShares(shares_array) {
    const map = new Map();
    shares_array.forEach(share => {
        const key = share.company;
        const value = {...share};
        delete value.company;
        map.set(key, value)
    })

    return map;
}


function handleError(error_code) {
    if(error_code === 404) {
        return "Can't access user profile. Try to login again."
    } else {
        return "Loading error. Try to refresh page."
    }
}

let dealMessageTimeout = setTimeout(()=>{},0);

class Broker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            started: false,
            broker: "",
            shares: null,

            window: {
                type: null,
                company: null
            },
            dealMessage: null,

            loaded: false,
            error: ""
        }


        this.socket = io('http://localhost:8080');

        this.getBroker = this.getBroker.bind(this);
        this.getShares = this.getShares.bind(this);
        this.setupSocket = this.setupSocket.bind(this);
        this.openDealWindow = this.openDealWindow.bind(this);
        this.closeDealWindow = this.closeDealWindow.bind(this);

        this.buy = this.buy.bind(this);
        this.sell = this.sell.bind(this);
    }

    getBroker(token) {
        return axios.get("http://localhost:3030/broker", {params: { token }})
            .then(response => this.setState({broker: response.data}))
    }

    getShares() {
        return axios.get("http://localhost:3030/shares")
            .then(response => this.setState({shares: mapShares(response.data)}))
    }

    setupSocket() {
        this.socket.on("changeBroker", (err, broker) => {
            if(err) {
                this.setState({dealMessage: err })
                clearTimeout(dealMessageTimeout)
                dealMessageTimeout = setTimeout(
                    () => {this.setState({dealMessage: null })},
                    3000
                )
            } else {
                this.setState({broker: broker});
            }
        })

        this.socket.on("changeShare", (company, share) => {
            this.state.shares.set(company, share)
            this.setState({
                shares: this.state.shares
            })
        })

        this.socket.on("updateShares", (new_shares) => {
            this.setState({shares: mapShares(new_shares)})
        })

        this.socket.on("start", () => {
            this.setState({started: true})
        })

        this.socket.on("end", () => {
            this.setState({started: false})
        })
    }

    componentDidMount() {
        const url = new URL(window.location.href,);
        this.token = url.searchParams.get('token');

        Promise.all([
            this.getBroker(this.token),
            this.getShares(),
        ])
        .then(() => {
            this.setState({loaded: true})
            this.setupSocket();
        })
        .catch(error => {
            this.setState({error: handleError(error.response.status)})
        })
    }

    openDealWindow(type, company) {
        this.setState({
            window: {
                type: null
            }
        })

        setTimeout(() => {
            this.setState({
                window: {
                    type,
                    company
                }
            });
        })
    }

    closeDealWindow() {
        this.setState({
            window: {
                type: null,
                company: null
            }
        })
    }

    buy(company, count) {
        this.socket.emit("buy", this.token, company, count)
    }

    sell(company, count) {
        this.socket.emit("sell", this.token, company, count)
    }

    render() {
        if(this.state.loaded) {
            return(
                <div className='wrapper'>
                    <div className="header">
                        <BrokerBlock broker={this.state.broker}/>
                        {this.state.started ? null : <h1>Trades will start soon</h1>}
                    </div>

                    <TableShares shares={this.state.shares} onClick={key => this.openDealWindow("buy", key)}/>
                    <TableBrokerShares
                        brokerShares={this.state.broker.shares}
                        sharesSource={this.state.shares}
                        onClick={key => this.openDealWindow("sell", key)}
                    />

                    {
                        this.state.window.type === "buy" ?
                            <DealBlock
                                conf={this.state.window}
                                brokerSource={this.state.broker}
                                sharesSource={this.state.shares}
                                onSubmit={this.buy}
                                onClose={this.closeDealWindow}
                                disabled={!this.state.started}
                                message={this.state.dealMessage}
                            /> :
                        this.state.window.type === "sell" ?
                            <DealBlock
                                conf={this.state.window}
                                brokerSource={this.state.broker}
                                sharesSource={this.state.shares}
                                onSubmit={this.sell}
                                onClose={this.closeDealWindow}
                                disabled={!this.state.started}
                                message={this.state.dealMessage}
                            /> :
                        null
                    }
                </div>
            )
        } else if(this.state.error){
            return (
                <div className='error'>
                    <h3>Error!</h3>
                    <p>{this.state.error}</p>
                    <a href="/">Login page</a>
                </div>
            )
        } else {
            return(
                <div className="loading">
                    LOADING...
                </div>
            )
        }
    }
}

export default Broker
