import { useState, useContext, useEffect } from 'react';
import AutocompleteInput from "@/components/Main/AutocompleteInput";

import { apiPost, scaleEffect, myCaptcha } from '@/components/HelpFunctions.jsx';

export default function SuggestForm(props) {


  if (props.item == null) {
    return null;
  }
  const context = useContext(props.context);
  const [item, setItem] = useState(props.item);
  const [parents, setParents] = useState(props.parents);
  let itemForm = null;
  useEffect(() => {
    itemForm = document.querySelector('.item-form');
    scaleEffect.show(itemForm);
    myCaptcha.create('myCaptcha');
    return () => {

    }
  }, []);
  if (item == null) {
    return null;
  }

  //functions 
  function hideEditForm(response) {
    scaleEffect.hide(document.querySelector('.item-form'), () => {
      context.editForm.hide();
      context.setMessage(response.message);
    });

  }


  function suggestItem() {

    if (myCaptcha.validate()) {
      apiPost(route("api.suggest"), { item: item, parents: parents }, context.token, hideEditForm);
    } else {
      context.setMessage("wrong captcha!");
    }
  }


  function updateItemState(evt) {
    item[evt.target.dataset.field] = evt.target.value;
    setItem(item);
  }

  function dropParent(evt) {
    setParents(parents.filter((s) => s.id != evt.target.dataset.id));
  }

  function addParent(newParent) {
    setParents([...parents, newParent]);
  }



  context.resetPage();

  const readonly = (item.id > 0);

  return <div className="item-form" style={{ top: `calc(2vh + ${window.scrollY}px)`, 'visibility': 'hidden' }}>
    <div className="edit-btn material-symbols-outlined" onClick={hideEditForm}>close</div>
    <div>
      <label className="block">Title</label>
      <input type="text" data-field="name" defaultValue={item.name} onChange={updateItemState} disabled={readonly}></input>
    </div>

    <div>
      <label className="block">Parents</label>
      <AutocompleteInput
        handler={addParent}
        context={props.context}
      ></AutocompleteInput>

      <div><small>Write parent name and press enter</small></div>
      {parents.map((p) => <div key={`suggest-parent-${p.id}`} data-id={p.Id} className={`item-parent status-option-${p.status}`}>
        <div className="edit-btn" key={`suggest-parent-drop-${p.Id}`} data-id={p.id} onClick={dropParent}>x</div>
        {p.name}
      </div>)}

    </div>
    <div>
      <label className="block">Notes</label>
      <textarea onChange={updateItemState} data-field="note" placeholder="Source or contacts for discussion..."></textarea>
    </div>
    <div>

      <input type="text" onChange={(e) => myCaptcha.set(e)} placeholder="Type code:" style={{ width: '100px' }}></input><canvas id="myCaptcha" style={{ width: '100px', height: '50px', display: 'inline-block', marginTop: '20px' }}></canvas>
    </div>
    <div>
      <button onClick={() => suggestItem()} className="btn">Suggest</button>
    </div>
  </div >

}