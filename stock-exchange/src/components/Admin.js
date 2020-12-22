import React, {Component} from 'react'
import axios from 'axios'
import TableShares from "./TableShares";

import io from 'socket.io-client';

import "./styles/admin.css"
import TableBrokers from "./TableBrokers";
import TableBrokerShares from "./TableBrokerShares";

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


function mapBrokers(brokers_array) {
    const map = new Map();
    brokers_array.forEach(broker => {
        const key = broker.username;
        const value = {...broker};
        delete value.username;
        map.set(key, value);
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

let intervalMessageTimeout = setTimeout(()=>{},0);

class Broker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            brokers: null,
            shares: null,
            intervalMessage: "",

            chosenBroker: "",
            chosenShare: "",

            loaded: false,
            error: ""
        }


        this.socket = io('http://localhost:8080');
        this.socket.emit("admin");
        this.distribution = 'linear';

        this.getBrokers = this.getBrokers.bind(this);
        this.getShares = this.getShares.bind(this);
        this.setupSocket = this.setupSocket.bind(this);
        this.showBrokerTable = this.showBrokerTable.bind(this);
        this.closeBrokerTable = this.closeBrokerTable.bind(this);
        this.showDistributionSetter = this.showDistributionSetter.bind(this);
        this.closeDistributionSetter = this.closeDistributionSetter.bind(this);
        this.changeDistribution = this.changeDistribution.bind(this);
        this.start = this.start.bind(this);
        this.end = this.end.bind(this);
        this.validateInterval = this.validateInterval.bind(this);
    }

    getBrokers() {
        return axios.get("http://localhost:3030/brokers",)
            .then(response => this.setState({brokers: mapBrokers(response.data)}))
    }

    getShares() {
        return axios.get("http://localhost:3030/shares")
            .then(response => this.setState({shares: mapShares(response.data)}))
    }

    setupSocket() {
        this.socket.on("changeBroker", (token, broker) => {
            this.state.brokers.set(token, broker)
            this.setState({
                brokers: this.state.brokers
            })
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
    }

    componentDidMount() {
        Promise.all([
            this.getBrokers(),
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

    start() {
        clearTimeout(intervalMessageTimeout);
        let message = "";
        if(this.interval){
            this.socket.emit("start", this.interval);
            message = "Trades are started"
        } else {
            message = "Interval can't be zero"
        }

        this.setState({intervalMessage: message})
        intervalMessageTimeout = setTimeout(() => {
            this.setState({intervalMessage: ""})
        }, 3000);
    }

    end() {
        this.socket.emit("end");
        clearTimeout(intervalMessageTimeout);
        this.setState({intervalMessage: "Trades are stopped"})
        intervalMessageTimeout = setTimeout(() => {
            this.setState({intervalMessage: ""})
        }, 3000);
    }

    showBrokerTable(username) {
        this.setState({chosenBroker: username})
    }

    closeBrokerTable() {
        this.setState({chosenBroker: null})
    }

    showDistributionSetter(company) {
        this.setState({chosenShare: company})
    }

    closeDistributionSetter() {
        this.setState({chosenShare: null})
    }

    async changeDistribution(){
        console.log(this.distribution)
        await axios.put("http://localhost:3030/setdistr", {company: this.state.chosenShare, distribution: this.distribution})
        this.closeDistributionSetter();
    }

    preventInterval(event) {
        if(isNaN(parseInt(event.key))) {
            event.preventDefault();
        }
    }

    validateInterval(event) {
        if(parseInt(event.target.value) < 0 ) {
            event.target.value = 0;
        }

        this.interval = parseInt(event.target.value);
    }

    render() {
        if(this.state.loaded) {
            return(
                <div className='wrapper'>
                    <h1>ADMIN</h1>
                    <div className='interval-wrapper'>
                        <label htmlFor="interval">Interval</label>
                        <input id="interval" type="number" defaultValue={0} onKeyPress={this.preventInterval} onChange={this.validateInterval}/>
                    </div>
                    <div className='interval-message'>
                        {this.state.intervalMessage}
                    </div>
                    <div className='buttons'>
                        <button className="control" onClick={this.start}>Start</button>
                        <button className="control" onClick={this.end}>End</button>
                    </div>
                    <TableShares shares={this.state.shares} onClick={this.showDistributionSetter} header={"Stock shares"}/>
                    <TableBrokers brokers={this.state.brokers} onClick={this.showBrokerTable}/>
                    {this.state.chosenBroker ?
                        <div className='table-broker-shares'>
                            <button type='button' className='close' onClick={this.closeBrokerTable}>&times;</button>
                            <TableBrokerShares
                                brokerShares={this.state.brokers.get(this.state.chosenBroker).shares}
                                sharesSource={this.state.shares}
                                header={this.state.chosenBroker}
                            />
                        </div> :
                        null
                    }

                    {this.state.chosenShare ?
                        <div>
                            <div className='modal'>
                                <div className='modal-header'>
                                    <h3>{this.state.chosenShare}</h3>
                                    <button className='close' onClick={this.closeDistributionSetter}>&times;</button>
                                </div>
                                <div className='modal-body'>
                                    <label htmlFor="distribution">Select distribution</label>
                                    <div className='select-wrapper'>
                                        <div className='selector-icon'/>
                                        <select
                                            name="distribution"
                                            id="distribution"
                                            defaultValue='linear'
                                            onChange={(event) => {
                                                this.distribution = event.target.value;
                                            }}>
                                            <option value="linear">Linear</option>
                                            <option value="normal">Normal</option>
                                        </select>
                                    </div>
                                    <button className='submit' onClick={this.changeDistribution}>Accept</button>
                                </div>
                            </div>
                            <div id='overlay' onClick={this.closeDistributionSetter}/>
                        </div> :
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
