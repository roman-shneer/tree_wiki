import { useState } from 'react';
import { apiPost } from '@/components/HelpFunctions.jsx';

export default function Suggestions(props) { 
    if (props.list.length == 0) { 
        return null;
    }
    const [list, setList] = useState(props.list);
   
    function updateSuggestion(id, com) {
        apiPost(route('api.suggestions.update'), { 'id': id, 'com': com }, props.token, (result) => {
           
            setList(result.list);
        });
    }

    function renderParents(parents) {
        return <table className='border-table'>
            <tbody>
                {parents.map((p) => <tr key={`visits-graph-parents-${p.id}`}><td>{p.id}</td><td>{p.name}</td></tr>)}
            </tbody>
        </table>;
    }
    
    return <table border="1" className='border-table' style={{ marginBottom: '1em' }}>
            <tbody>
                <tr key={`suggestions-0`}>
                    <th>id</th>
                    <th>mId</th>
                    <th>name</th>
                    <th>parents</th>
                    <th>notes</th>
                    <th>updated</th>
                    <th>&nbsp;</th>
                </tr>
                {list.map((m) =>
                    <tr key={`suggestions-${m.id}`}>
                        <td>{m.id}</td>
                        <td>{m.item.id}</td>
                        <td>{m.item.name}</td>
                        <td>{renderParents(m.parents)}</td>
                        <td>{m.item.note}</td>
                        <td>{m.updated}</td>
                        <td>
                            <button className='btn marginl' onClick={() => updateSuggestion(m.id, 'approve')}>Approve</button>
                            <button className='btn marginl' onClick={() => updateSuggestion(m.id, 'delete')}>Delete</button>
                        </td>
                    </tr>)}
            </tbody>
        </table>
}