import React from 'react'

import './styles/table.css'

function TableShares({shares, onClick, header}) {
    function click(key) {
        if(onClick) {
            onClick(key);
        }
    }

    return(
        <div className="table-shares-wrapper">
            <table>
                <caption>{header || "Share Market"}</caption>
                <tbody>
                    <tr>
                        <th className='noselect'>Company</th>
                        <th className='noselect'>Price</th>
                        <th className='noselect'>Count</th>
                    </tr>

                    {Array.from(shares.entries()).map(([key, value]) => (
                        <tr onClick={() => click(key)} key={key}>
                            <td className='noselect'>{key}</td>
                            <td className='noselect'>{value.price}</td>
                            <td className='noselect'>{value.count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TableShares
