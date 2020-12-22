import React from 'react';

import './styles/table.css'

function TableBrokerShares({brokerShares, sharesSource, onClick, header}) {
    function click(key) {
        if(onClick) {
            onClick(key)
        }
    }

    return(
        <div className="table-broker-shares-wrapper">
            <table>
                <caption>{header || 'Your shares'}</caption>
                <tbody>
                <tr>
                    <th className='noselect'>Company</th>
                    <th className='noselect'>Price</th>
                    <th className='noselect'>Count</th>
                    <th className='noselect'>Total Price</th>
                </tr>

                {brokerShares.map(([key, count]) => (
                    <tr onClick={() => click(key)} key={key}>
                        <td className='noselect'>{key}</td>
                        <td className='noselect'>{sharesSource.get(key).price}</td>
                        <td className='noselect'>{count}</td>
                        <td className='noselect'>{count * sharesSource.get(key).price}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

export default TableBrokerShares;
