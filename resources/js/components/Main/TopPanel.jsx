import { useState,useContext  } from 'react';
import AutocompleteInput from "@/components/Main/AutocompleteInput";


export default function TopPanel(props) { 

    const context = useContext(props.context);
    
    const [filter, setFilter] = useState(props.filter);


    function updateFilter(filterName, value) { 
        filter[filterName] = value;
        setFilter(filter);
        context.updateFilter(filterName, value);
    }

    function dropParent(evt) {
        updateFilter('crosses', filter.crosses.filter(
            (s) => s.id != evt.target.dataset.id
        ));       
    }
  
  
    function selectType() {
       
        if (filter.genus == 0) {
            return null;
        }
        const types = context.categories.filter(s => s.genus == filter.genus);
        return <span className="marginl margint top-p-elm">
            <select onChange={(evt) => updateFilter('category', evt.target.value)} >
            <option value="0" key="cat0">-type-</option>
            {types.map((opt) => <option value={opt.id} key={`cat${opt.id}`}>{opt.name}</option>)}
            </select>
        </span>;
    }

    function getGenus() {
        return Array.from(new Set(context.categories.map(s => s.genus)))
    }

    function handlerCross(cross) { 
      
        if (cross.id == -1) { 
            return;
        }
        filter.crosses.push(cross);
      
        updateFilter('crosses', filter.crosses);
    }

      return <div key="top-panel" className='margin-1rem'> 
        <button onClick={props.addNew} key="top-pannel-btn" className="btn margint top-p-elm mobile-block">Suggest new</button>
        <span className="top-p-elm nowrap margint mobile-block">
          <input type="text" onChange={(evt)=>updateFilter("term", evt.target.value)} placeholder="Type strain name" data-field="filterTerm"></input>
        </span>
        <span className='mobile-block margint'>
          <span className="top-p-elm">
            <select onChange={(evt) => {
                      updateFilter('category', 0);                      
                      updateFilter('genus', evt.target.value);                           
            }} data-field="filterGenus">
              <option value="0" key="cat0">-genus-</option>
              {getGenus().map((g => <option key={`genus${g}`}>{g}</option>))}
            </select>
          </span>
          {selectType()}
        </span>
        <span className='mobile-block margint'>
          <span className='top-p-elm'>
                  <span className='inline-block'>
                      <AutocompleteInput                         
                          placeholder='Cross of strain...'                          
                          context={props.context}
                          handler={handlerCross}
                      ></AutocompleteInput></span>
          </span>
          <span className='top-p-elm'>
            {filter.crosses.map((p) => <div key={`suggest-parent-${p.id}`} data-id={p.Id} className={`item-parent`}>
              <div className="edit-btn" key={`suggest-parent-drop-${p.Id}`} data-id={p.id} onClick={dropParent}>x</div>
              {p.name}
            </div>)}
          </span>
  
        </span>      
      </div>

}