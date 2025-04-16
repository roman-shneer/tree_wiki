import { useState, useContext } from 'react';
import { LazyLoadImage } from "react-lazy-load-image-component";

function intersect(array1, array2) {
    let result = false;

    array1.forEach(a => {
      if (array2.includes(a)) {
        result = true;
      }
    });
    return result;
}
  
export default function ItemsGrid(props) { 

    const context = useContext(props.context);
    const filter = useState(props.filter)[0];
    

    const term = props.filter.term.toLowerCase();
   
    let items = props.list;
      
    //genus filter
    if (props.filter.genus != 0) {
      const categoryIds = context.categories.filter(c => c.genus == props.filter.genus).map(c => c.id.toString());
      items = items.filter((s) => s.cats != null && intersect(categoryIds, s.cats.split(',')));

    }
    //filter via Category
    if (props.filter.category > 0) {
      items = items.filter((s) => s.cats != null && s.cats.split(',').includes(props.filter.category));
    }

    //filter via crosses
    if (props.filter.crosses.length > 0) {
      const crossIds = props.filter.crosses.map(s => s.id);

      items = items.filter(s => {
        let correct = 0;
        s.parents.forEach(p => {
          if (crossIds.includes(parseInt(p))) {
            correct++;
          }
        });
        return correct == crossIds.length;
      });
    }


    function renderImage(m){

      let img = m.image_thumb.length > 0 ? m.image_thumb : m.image;

      if (img == '/storage/uploads/' || img == null || img.length == 0) {

        return <img src="/storage/uploads/0.jpeg" className='transparent' alt="No Image" />
      }
      return <LazyLoadImage src={img} loading="lazy" alt={m.name} />;

    };

    function getTitle (item, addTitle){

      if (item.parents == null) {
        return null;
      }
      const parents = item.parents.filter((e, i, self) => i === self.indexOf(e));
      let result = '';
     
      switch (parents.length) {
        case 0:
          return null;
          break;
        case 1:
          result = "iso of " + context.getName(parents[0]);
          break;
        case 2:
          result = "cross of " + parents.map(s => context.getName(s)).join(" and ");
          break;
        default:
          result = " cross of " + parents.map(s => context.getName(s)).join(" ,");
      }
      if (addTitle) {
        result = `${item.name} - ${result}`;
      }
      return result;

    }

  //filterTerm
  
    items = items.filter((s) => s.name.toLowerCase().includes(term) || (s.name_alter != null && s.name_alter.toLowerCase().includes(term)));

  return [
    <div className='margin-1rem' key="found">Found: <b>{items.length}</b></div>,
    <div className="list margin-1rem" key="list">
    {items.map((mush) =>
      <a href={mush.url} title={getTitle(mush, true)} className="item" data-id={mush.id} data-parents={mush.parents} data-children={mush.children} onClick={context.reportForm.show} key={`strain${mush.id}`} >
        {renderImage(mush)}
        <div key={`name${mush.id}`} data-id={mush.id} className='item-title'>{mush.name}</div>
        <small>{getTitle(mush, false)}</small>
      </a>)}
  </div>];
}