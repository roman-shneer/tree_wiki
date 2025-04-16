import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { apiPost } from '@/components/HelpFunctions.jsx';
let imagesSizes = {};
export default function AdminImages(props) {

    const [items,] = useState(props.items);

    const [filterNoThumbs, setFilterNoThumbs] = useState(0);
    const [filterTooLarge, setFilterTooLarge] = useState(0);

 

    function imageThumbLoaded(evt) {

       
        const box = document.createElement('div');
        box.innerText = `${evt.target.naturalWidth}x${evt.target.naturalHeight}`;
        evt.target.parentNode.append(box);

    }


    function renderThumb(item) {
        if (item.image_thumb.length > 0) {
            return <div>
                <img src={item.image_thumb} style={{ width: '100px' }} onLoad={imageThumbLoaded} data-src={item.image}></img>
                <b onClick={deleteThumb} data-id={item.id}>delete</b>
            </div>
        } else {
            return <b onClick={createThumb} data-id={item.id}>create thumb</b>;
        }
    }


    function imageLoaded(evt) {
       
        imagesSizes[evt.target.dataset.src] = `${evt.target.naturalWidth}x${evt.target.naturalHeight}`;
       
        const box = document.createElement('div');
        box.innerText = `${evt.target.naturalWidth}x${evt.target.naturalHeight}`;
        const button = document.createElement('button');
        button.innerText = "resize";
        button.className = "block";
        button.dataset.id = evt.target.dataset.id;

        button.addEventListener('click', resizeImage);
        box.appendChild(button);
        evt.target.parentNode.append(box);

    }
    function createThumb(evt) {
        apiPost(route('admin.images.thumb'), { id: evt.target.dataset.id }, props.token, () => window.location.reload);

    }

    function deleteThumb(evt) {
        if (confirm("Sure delete thumb?")) {
            console.log(evt.target.dataset.id);
            apiPost(route('admin.images.thumb.delete'), { id: evt.target.dataset.id }, props.token, () => window.location.reload);
        }

    }

    function renderFilters() { 
        function changeFilter(evt) { 
            if (evt.target.dataset.field == 'filterNoThumbs') { 
                setFilterNoThumbs(evt.target.checked);
            }
            if (evt.target.dataset.field == 'filterTooLarge') { 
                setFilterTooLarge(evt.target.checked);
            }
           
        }   

        return <div>
            <label htmlFor='no-thumbs'>No Thumbs</label><input id="no-thumbs" type="checkbox" defaultValue={filterNoThumbs} onChange={changeFilter} data-field="filterNoThumbs"></input>
            <label htmlFor='too-large'>Too Large</label><input id="too-large" type="checkbox" defaultValue={filterTooLarge} onChange={changeFilter} data-field="filterTooLarge"></input>
        </div>
    }


    function resizeImage(evt) {
        apiPost(route('admin.images.resize'), { id: evt.target.dataset.id }, props.token, () => window.location.reload);
    }
    let itemsToDisplay = items;
    if (filterNoThumbs) { 
        itemsToDisplay = itemsToDisplay.map(i => {
            i.visible = i.image_thumb.length == 0;
            return i;
        });
       
      
    }
    if (filterTooLarge) { 
        itemsToDisplay = itemsToDisplay.map(i => {
            if (typeof imagesSizes[i.image] == 'undefined') { 
              
                i.visible = true;
                return i;
            }
            const size = imagesSizes[i.image].split('x').map(s=>parseInt(s));
            i.visible = size[0] > 474 || size[1] > 474;
            return i;
        });
       
    }


    return (
        <AuthenticatedLayout
            user={props.auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Images Management</h2>}
        >
            <Head title="Images Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">You're logged in!</div>
                        {renderFilters()}
                        <table border="1">
                            <tbody>
                                <tr>
                                    <td>Strain</td>
                                    <td>Large Image</td>
                                    <td>Thumb</td>

                                </tr>
                                {itemsToDisplay.map(item => <tr className={item.visible==false?'hidden':''}>
                                    <td style={{ verticalAlign: 'top' }}>{item.name}</td>
                                    <td style={{ verticalAlign: 'top' }}><img src={item.image} data-id={item.id} style={{ width: '100px' }} onLoad={imageLoaded} data-src={ item.image} /></td>
                                    <td style={{ verticalAlign: 'top' }}>{renderThumb(item)}</td>
                                </tr>)}
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );

}