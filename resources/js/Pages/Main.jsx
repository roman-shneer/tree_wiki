import React, {useState} from 'react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import GuestLayout from '@/Layouts/GuestLayout.jsx';
import Report from "@/components/Main/Report";
import SuggestForm from "@/components/Main/SuggestForm";
import ItemForm from "@/components/Main/ItemForm";
import TopPanel from "@/components/Main/TopPanel";
import ItemsGrid from "@/components/Main/ItemsGrid";
import { apiPost, apiGet,scaleEffect } from '@/components/HelpFunctions.jsx';
function Main(props){

  //images = [];
  const itemNames = {};
  
  
  const [filterTerm, setFilterTerm] = useState('');
  const [filterGenus, setFilterGenus] = useState(0);
  const [filterCategory, setFilterCategory] = useState(0);
  const [filterCrosses, setFilterCrosses] = useState([]);
  const [filterUpdated, setFilterUpdated] = useState( new Date().getTime());
  const filter= {
    term: filterTerm,
    genus: filterGenus,
    category: filterCategory,
    crosses: filterCrosses,
    updated: filterUpdated
  };

  const [item, setItem] = useState(props.item);
  
  const [parents, setParents] = useState(props.parents);
  const [report, setReport] = useState(props.report);
  const [list, setList] = useState(props.list);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  props.list.forEach(item => {
    itemNames[item.id] = { name: item.name, nameAlter: item.name_alter };
  });

  function addNew() {
    setItem({ name: "", id: -1, cats: [] });
    setParents([])    
  }

  function renderMessage() {
    if (message == null) {
      return null;
    }
    setTimeout(() => {
      setMessage(null);      
    }, 5000);
    return <div className="popup">{message}</div>
  }

  function getName (id) {
    return itemNames[id].name;
  }

  ///EDIT FORM
  const editForm = new function (){ 
    this.div = function () { 
      return document.querySelector('.item-form');
    }
    
    this.show = (evt) => {
      
      evt.stopPropagation();
      evt.preventDefault();

     
      scaleEffect.hide(reportForm.div(), () => { 
        setReport(null);
        
        apiPost(route('api.edit'), { id: evt.target.dataset.id }, props.token, (result) => { 
          
          setItem(result.item);
          setParents(result.parents);
        });
      });

    };

    this.hide = () => {      
      if (this.div() != null) { 
        scaleEffect.hide(this.div(), () => { 
          setItem(null);
          setParents([]);
        });
      }            
    };
  };

  /// REPORT FORM 
  const reportForm = new function () {
    
    this.div = function () { 
      return document.querySelector('.annotation-box');
    };
    
    this.requestReport = function (id) {
      setLoading(true);
      editForm.hide();      
      apiGet(
        route("api.report", id),
        (result) => {
  
          setPage(result.report.item.url, result.report.item.name, result.report.item.description);          
          setReport(result.report);
          setLoading(false);
        }
      );
    };

    this.show = (evt) => {
      
     
      evt.stopPropagation();
      evt.preventDefault();
      const id = (typeof evt.target.dataset != 'undefined' && typeof evt.target.dataset.id != 'undefined') ? evt.target.dataset.id : evt.target.parentNode.dataset.id;
     
      if (report != null) {
        if (report.item.id == id) {
          return;
        } else {
          scaleEffect.hide(this.div(), ()=>{
            setReport(null);
            this.requestReport(id);
          });
        
          return;
          
        }
      }
        
      this.requestReport(id);
    };
    
    this.hide = function () {       
      if (this.div() != null) { 
        scaleEffect.hide(this.div(), () => {
          setReport(null);
        });
      }
      
      
    }
  };



  function setPage(url, title, description) {
    console.log('setPage');
    document.title = `${title} - ${import.meta.env.VITE_APP_NAME}`;
    document.querySelector('#meta-description').setAttribute('value', description.substr(0, 170));
    history.pushState({}, document.title, url);
  }

  function resetPage() {   
    console.log('resetPage');
    document.title = import.meta.env.VITE_APP_NAME;
    document.querySelector('#meta-description').setAttribute('value', import.meta.env.VITE_APP_DESCRIPTION);
    history.pushState({}, "", `/`);
  }

  function ifEmpty(object) {
    return Object.getOwnPropertyNames(object).length === 0;
  }

  
  function updateFilter(filterName, value) { 
    switch (filterName) { 
      case 'term':
        setFilterTerm(value);
      break;
      case 'crosses':
        setFilterCrosses(value);
        break;
      case 'genus':
        setFilterGenus(value);
        break;
      case 'category':
        setFilterCategory(value);
        break;
    }
    setFilterUpdated(new Date().getTime());        
  }
 

  const context = React.createContext({
      categories: props.categories,
      getName: getName,
      editForm: editForm,     
      reportForm:reportForm,
      ifEmpty: ifEmpty,      
      resetPage: resetPage,    
      setMessage:setMessage,     
      token: props.token,
      updateFilter: updateFilter,
      setList:setList
    });
    
  
    return [

      (props.auth.user == null) ? <SuggestForm
        item={item}
        parents={parents}
        context={context}
        key='SuggestForm'
      ></SuggestForm> : <ItemForm
        item={item}
        parents={parents}
        context={context}
        key='ItemForm'
      ></ItemForm>,
      loading && <div className='loading-icon'></div>,      
      <TopPanel
        filter={filter}                       
        context={context}
        addNew={addNew}
        key='TopPanel'
      ></TopPanel>,
      <ItemsGrid
        filter={filter}        
        list={list}        
        context={context}
        key='ItemsGrid'
      ></ItemsGrid>,
      renderMessage(),
      report && <Report
        report={report}              
        context={context}
        key='Report'
      ></Report>

    ];
 




}



Main.layout = (page) => {

  if (page.props.auth.user != null) {
    return (<AuthenticatedLayout children={page} user={page.props.user} suggestedCount={page.props.suggestedCount}></AuthenticatedLayout>)
  } else {
    return <GuestLayout children={page} ></GuestLayout>
  }
}



export default Main;
