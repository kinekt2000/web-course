import React from 'react'

import './styles/broker-block.css'

function BrokerBlock({broker}){
    return(
        <div className="broker-wrapper">
            <div>
                <h4>{broker.name}</h4>
                <p>
                    <span>Fund:</span>
                    <span>{broker.fund}</span>
                </p>
                <p>
                    <span>Profit:</span>
                    <span className={broker.profit > 0 ? 'green' : broker.profit < 0 ? 'red' : null}>{broker.profit}</span>
                </p>
            </div>
        </div>
    )
}

export default BrokerBlock;
