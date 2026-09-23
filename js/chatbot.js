(function(){
  'use strict';
  function initChatbot(){
    var launcher=document.getElementById('chatbot-launcher');
    var panel=document.getElementById('chatbot-panel');
    var close=document.getElementById('chatbot-close');
    var form=document.getElementById('chatbot-form');
    var input=document.getElementById('chatbot-input');
    var messages=document.getElementById('chatbot-messages');
    var quick=document.getElementById('chatbot-quick');
    if(!launcher||!panel||!close||!form||!input||!messages) return;

    var history=[];
    var opened=false;

    function addMessage(text,who){
      var el=document.createElement('div');
      el.className='chatbot-message '+(who==='user'?'user':'bot');
      el.textContent=text;
      messages.appendChild(el);
      messages.scrollTop=messages.scrollHeight;
    }
    function openChat(){
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden','false');
      launcher.setAttribute('aria-expanded','true');
      opened=true;
      if(!messages.children.length){
        addMessage('Hi! I’m the SKM AI Assistant. Ask me about AI automation, chatbots, workflow automation, integrations, projects, pricing, or starting a project.','bot');
      }
      setTimeout(function(){input.focus();},50);
    }
    function closeChat(){
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden','true');
      launcher.setAttribute('aria-expanded','false');
      opened=false;
      launcher.focus();
    }
    function addTyping(){
      var t=document.createElement('div');
      t.className='chatbot-message bot chatbot-typing';
      t.setAttribute('aria-label','Assistant is typing');
      t.innerHTML='<i></i><i></i><i></i>';
      messages.appendChild(t);
      messages.scrollTop=messages.scrollHeight;
      return t;
    }
    async function ask(question){
      question=(question||'').trim();
      if(!question) return;
      addMessage(question,'user');
      history.push({role:'user',content:question});
      input.value='';
      input.disabled=true;
      var send=form.querySelector('.chatbot-send');
      if(send) send.disabled=true;
      var typing=addTyping();
      try{
        var response=await fetch('/.netlify/functions/chat',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({messages:history.slice(-12)})
        });
        var data=await response.json().catch(function(){return {};});
        typing.remove();
        if(!response.ok) throw new Error(data.error||'Chat service unavailable');
        var reply=(data.reply||'I’m not sure about that yet. Tell me more about the business problem you want to solve.').trim();
        addMessage(reply,'bot');
        history.push({role:'assistant',content:reply});
      }catch(err){
        typing.remove();
        addMessage('I’m having trouble reaching the Gemini AI service right now. Please try again, or contact SKM at skm.ai.automations@gmail.com.','bot');
        console.error('Chatbot error:',err);
      }finally{
        input.disabled=false;
        if(send) send.disabled=false;
        input.focus();
      }
    }
    launcher.addEventListener('click',function(){opened?closeChat():openChat();});
    close.addEventListener('click',closeChat);
    form.addEventListener('submit',function(e){e.preventDefault();ask(input.value);});
    if(quick) quick.addEventListener('click',function(e){var b=e.target.closest('[data-question]');if(b) ask(b.getAttribute('data-question'));});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&opened) closeChat();});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initChatbot); else initChatbot();
})();
