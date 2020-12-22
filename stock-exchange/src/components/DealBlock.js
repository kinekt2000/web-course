import React, {useState} from 'react'

import './styles/deal-block.css'

function DealBlock({conf, brokerSource, sharesSource, onSubmit, onClose, disabled, message}) {
    const [count, setCount] = useState(0)

    function numberChange(event) {
        const share = sharesSource.get(conf.company)
        const brokerShare = brokerSource.shares.find(([key, _]) => key === conf.company);

        const count = conf.type === "buy" ? share.count : brokerShare[1];

        const el = event.target;
        if(el.value > count) {
            el.value = count;
        }
        if(el.value < 0) {
            el.value = 0;
        }

        setCount(parseInt(el.value));
    }

    function input(event) {
        if(isNaN(parseInt(event.key))){
            event.preventDefault();
        }
    }

    return (
        <div className='deal-block-wrapper'>
            <div>
                <button className='close' onClick={() => {onClose()}}>&times;</button>
                <header>{conf.type}</header>
                <div className='deal-block-data'>
                    <span className='company'>{conf.company}</span>
                    <p className='price'>
                        <span>Price:</span>
                        <span>{sharesSource.get(conf.company).price}</span>
                    </p>
                    {disabled ? null : <input type="number" onKeyPress={input} onChange={numberChange} defaultValue={0}/>}
                    <small>{message}</small>
                    {disabled ? null : <button className='submit' onClick={() => onSubmit(conf.company, count)}>SUBMIT</button>}
                </div>
            </div>
        </div>
    )
}

export default DealBlock;
