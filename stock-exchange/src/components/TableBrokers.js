import React from 'react'

function TableBrokers({brokers, onClick, header}) {
    function click(key) {
        if(onClick) {
            onClick(key)
        }
    }

    return(
        <div className='table-brokers-wrapper'>
            <table>
                <caption>{header || "Brokers"}</caption>
                <tbody>
                    <tr>
                        <th className='noselect'>username</th>
                        <th className='noselect'>Name</th>
                        <th className='noselect'>Fund</th>
                    </tr>

                    {Array.from(brokers.entries()).map(([key, value]) => (
                        <tr onClick={() => click(key)} key={key}>
                            <td className='noselect'>{key}</td>
                            <td className='noselect'>{value.name}</td>
                            <td className='noselect'>{value.fund}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TableBrokers;
