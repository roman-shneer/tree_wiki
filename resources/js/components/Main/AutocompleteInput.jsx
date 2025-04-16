import { useState, useContext } from 'react';
import { apiPost } from '@/components/HelpFunctions.jsx';
export default function AutocompleteInput(props) { 
        
    const placeholder = props.placeholder != null ? props.placeholder : null;
    const callback = props.callback != null ? props.callback : null;
 
    const [match, setMatch] = useState("");
    const [parentsMatch, setParentsMatch] = useState(null);
    const context = useContext(props.context);

    let randomId = 0;
     
    function rid() {        
        randomId--;
        return randomId;
    }


    function selectParentMatch(evt) {
        
        if (evt.target.nodeName == "SELECT") {
            const dataset = evt.target.querySelectorAll("option")[evt.target.options.selectedIndex].dataset;
            props.handler({
                id: dataset.id,
            
                name: evt.target.value,
            });
            
        } else {
         
            props.handler({
                id: parseInt(evt.target.dataset.id),              
                name: evt.target.innerText,
            });
           
        }

        setParentsMatch(null);
        setMatch("");        
      
        if (callback != null) {
            callback();
        }
    }

    function RenderParentsMatch (){  

        if (parentsMatch == null) { 
            return null;
        }
        return <div  className="parents-match-div">
            {parentsMatch.map((m) => <div
                    className={`parent-match-item`}
                    key={`autocomplete${m.id}`}
                    data-id={m.id}                    
                    onClick={(evt) => selectParentMatch(evt)}
                >{m.name}{m.name_alter != null && m.name_alter != '' ? ` (${m.name_alter})` : ``}</div>)}
        </div>;      
    }

    function keyupHandler(evt){
        if (evt.keyCode == 40) {
            document.querySelector(".parents-match-div").focus();
        }
        if (evt.keyCode == 13) {           
            props.handler({
                id: rid(),
            
                name: evt.target.value,
            });            
            setMatch(""); 

        }
    };

    function showList(evt) {
        setMatch(evt.target.value);        
        if (match.length > 0) {
            apiPost(route('api.match'), { 'term': match },context.token, (response) => {
                if (response.list.length == 0) {
                    response.list = null;
                }
                setParentsMatch(response.list);                

            });
        } else {
            setParentsMatch(null);
            
        }        
    }


    return <span>
        <input type="text" className="block" value={match} onChange={(evt) => showList(evt)} onKeyUp={(evt) => keyupHandler(evt)} key="form-parents" placeholder={placeholder} />
        {RenderParentsMatch()}
    </span>
}