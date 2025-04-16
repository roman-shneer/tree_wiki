import { useState, useContext, useEffect } from 'react';
import AutocompleteInput from "@/components/Main/AutocompleteInput";
import { apiPost, scaleEffect } from '@/components/HelpFunctions.jsx';
export default function ItemForm(props) {
   
    if (props.item == null) {
        return null;
    }

    const item = useState(props.item)[0];
    const parents = useState(props.parents)[0];
    const context = useContext(props.context);
    const [itemCats, setItemCats] = useState(props.item.cats);
    const [itemGenus, setItemGenus] = useState(props.item.genus);
    const [, setItemType] = useState(props.item.type);//?
   

    useEffect(() => {            
        scaleEffect.show(document.querySelector('.item-form'));
    }, []);

    if (item == null) {
        return null;
    }

    context.resetPage();
   
    function saveItem() {        
        item.cats = itemCats;
        apiPost(
            route("api.save"),
            {
                item: item,
                parents: parents,

            },
            context.token,
            hideEditForm
        );
    }


    function deleteItem() {
        if (confirm("Sure to delete " + item.name + "?")) {
            apiPost(route("api.delete"), { id: item.id }, context.token, hideEditForm);
        }
    }



    function hideEditForm(response) {
        context.editForm.hide();
        if (typeof response.list != 'undefined') {
            context.setList(response.list);
        }
        
    }


    function SelectGenusType() {

        const categories = context.categories.filter(c => itemCats.includes(c.id));
        const allGenus = Array.from(new Set(context.categories.map(s => s.genus)));
        const genusTypes = context.categories.filter(c => c.genus == itemGenus);


        function dropCategory(e) {
            setItemCats(itemCats.filter(c => c != e.target.dataset.id));
        }

        function addCategory(genus, type) {
            const categoryId = context.categories.filter(c => c.name == type && c.genus == genus)[0].id;
            if (!itemCats.includes(categoryId)) {
                itemCats.push(categoryId);
                setItemCats(itemCats);
                setItemGenus(0);
                setItemType(null);
            }
        }


        return [
            <div key='select-genus-div'>
                <label>Category</label>
                <select data-field="genus" key='genus' onChange={(evt) => setItemGenus(evt.target.value)}>
                    <option value="0" key="cat0">-Genus-</option>
                    {allGenus.map((g => <option key={`genus${g}`}>{g}</option>))}
                </select>
                {(typeof itemGenus != 'undefined' && itemGenus != 0)
                    && <select data-field="type" key='type' onChange={(evt) => { setItemType(evt.target.value); addCategory(itemGenus, evt.target.value); }}>
                        <option value="0" key="type0">-Type-</option>
                        {genusTypes.map(t => <option key={`type${t.id}`}>{t.name}</option>)}
                    </select>}
            </div>,
            <div key='select-cat-div'>
                <div>{categories.map(c => <div className="item-parent" key={`parent-render-item-${c.id}`} >
                    <div className="edit-btn" data-id={c.id} onClick={dropCategory} >x</div>
                    {c.genus} {c.name}
                </div>)}</div>
            </div>
        ];
    }



    function RenderNameRow(props) {
        const [itemName, setItemName] = useState(props.item.name);

        return <div>
            <label className="block">Name</label>
            <input type="text" data-field="name" defaultValue={itemName} onChange={(evt) => {
                setItemName(evt.target.value);
                props.item.name = evt.target.value;
            }} key="form-title"></input>
        </div>
    }

    function RenderNameAlterRow(props) {
        const [itemNameAlter, setItemNameAlter] = useState(props.item.name_alter);
        return <div>
            <label className="block">Alternative Names</label>
            <input type="text" data-field="name_alter" defaultValue={itemNameAlter} onChange={(evt) => {
                setItemNameAlter(evt.target.value)
                props.item.name_alter = evt.target.value;
            }} key="form-name-alter"></input>
            <p><small>comma separated</small></p>
        </div>
    }

    function RenderDescriptionRow(props) {
        const [itemDescription, setItemDescription] = useState(props.item.description);
        return <div>
            <label className="block">Description</label>
            <textarea defaultValue={itemDescription} onChange={(evt) => {
                setItemDescription(evt.target.value);
                props.item.description = evt.target.value;
            }} data-field="description" key="form-description"></textarea>
        </div>;
    }

    function RenderImageRow(props) {
        const [itemImageFile, setItemImageFile] = useState(props.item.imageFile);
        const [itemImage, setItemImage] = useState(props.item.image);

        function updateFileState(e) {
            if (typeof e.target.files[0] == 'undefined') {
                if (typeof itemImageFile != 'undefined') {
                    setItemImageFile(null);
                    props.item.imageFile = null;
                }
                return;
            }
            const file_reader = new FileReader();
            file_reader.addEventListener('load', () => {
            
                setItemImageFile(file_reader.result);
                props.item.imageFile = file_reader.result;
            });
            file_reader.readAsDataURL(e.target.files[0]);

        }

        async function detectPaste(e) { 
            
            if (e.keyCode == 86) { 
                const clipboardContents = await navigator.clipboard.read();
                for (const item of clipboardContents) {
                if (!item.types.includes("image/png")) {
                    throw new Error("Clipboard does not contain PNG image data.");
                }
                const blob = await item.getType("image/png");                  
                    setItemImage(URL.createObjectURL(blob));   
                    var reader = new FileReader();
                    reader.readAsDataURL(blob); 
                    reader.onloadend = function() {
                        var base64data = reader.result;  
                        props.item.imageFile = base64data;
                       
                    }
                  
                }
            }
        }
    
        return <div>
            <label className="block">Image URL</label>
            <input type="text" data-field="image" defaultValue={itemImage} onChange={(evt) => {
                setItemImage(evt.target.value);
                props.item.image = evt.target.value;
            }} key="form-image" style={{ width: '50%' }}  onKeyDown={detectPaste} />
            <input type="file" data-field="image-file" onChange={updateFileState} key="form-image-file" style={{ width: '50%' }} />
            <div><img src={itemImage} style={{height:'100px'}}></img></div>
        </div>
    }

    function RenderPotencyRow(props) {
        const [itemPotencyMin, setItemPotencyMin] = useState(props.item.potencyMin);
        const [itemPotencyMax, setItemPotencyMax] = useState(props.item.potencyMax);
        return <div>
            <label>Potency:</label>
            <input type="number" data-field="potencyMin" defaultValue={itemPotencyMin} onChange={(evt) => {
                setItemPotencyMin(evt.target.value);
                props.item.potencyMin = evt.target.value;
            }} key="form-potencyMin" min="0" max="10" step="0.01" />
            <input type="number" data-field="potencyMax" defaultValue={itemPotencyMax} onChange={(evt) => {
                setItemPotencyMax(evt.target.value);
                props.item.potencyMax = evt.target.value;
            }} key="form-potencyMax" min="0" max="10" step="0.01" />
        </div>
    }

    function RenderCultyvationRow(props) {
        const [itemCultivation, setItemCultivation] = useState(props.item.cultivation);
        return <div>
            <label>Cultivation:</label>
            <select data-field="cultivation" defaultValue={itemCultivation} onChange={(evt) => {
                setItemCultivation(evt.target.value);
                props.item.cultivation = evt.target.value;
            }} key="form-cultivation">
                <option value="0" key="cult0">Unknown</option>
                <option value="1" key="cult1">Simple</option>
                <option value="2" key="cult2">Average</option>
                <option value="3" key="cult3">Difficult</option>
            </select>
        </div>
    }

    function RenderParentsRow(props) {
        const [parents, setParents] = useState(props.parents);

        function dropParent(evt) {
            const index = parents.findIndex((parent) => parent.id == evt.target.dataset.id);
            props.parents.splice(index, 1);
            setParents(props.parents);
        }

        function addParent(newParent) {
            const index = parents.findIndex((parent) => parent.id == newParent.id);
            if (index == -1) {
                setParents([...parents, newParent]);
                props.parents.push(newParent);
            }
        }

        return <div>
            <label className="block">Parents</label>
            <AutocompleteInput
                handler={addParent}
                context={props.context}></AutocompleteInput>
            <div><small>Write parent name and press enter</small></div>
            {parents.map((p) => <div className="item-parent" key={`parent-render-item-${p.id}`} >
                <div className="edit-btn" data-id={p.id} onClick={dropParent}>x</div>
                {p.name}
            </div>)}
        </div>
    }
    
    
    return <div className="item-form" key="item-form" style={{ top: `calc(2vh + ${window.scrollY}px)`,'visibility':'hidden' }}>
        <div className="edit-btn material-symbols-outlined" onClick={hideEditForm}>close</div>

        <RenderNameRow item={props.item} name={props.item.name}></RenderNameRow>
        <RenderNameAlterRow item={props.item}></RenderNameAlterRow>
        <SelectGenusType genus={props.item.genus} cats={props.item.cats}  ></SelectGenusType>
        <RenderDescriptionRow item={props.item}></RenderDescriptionRow>
        <RenderImageRow item={props.item}></RenderImageRow>
        <RenderParentsRow parents={parents} context={props.context}></RenderParentsRow>
        <RenderPotencyRow item={props.item}></RenderPotencyRow>
        <RenderCultyvationRow item={props.item}></RenderCultyvationRow>
        <div>
            <button onClick={saveItem} className="btn marginl">Save</button>
            <button onClick={deleteItem} className="btn marginl">Delete</button>
        </div>
    </div>
}