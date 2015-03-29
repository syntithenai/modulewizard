$(function() {
    $( "#tabs").tabs();
	
	// PERSIST MODULE SETTINGS
	$('#module .moduleconfig').change(function() {
		saveModule();
	});
	loadModule();
	
    // render actions when clicking the tab link
	$("#actionsbutton").click(function() {
		$('#actionslist').html(renderModulesAndActors());
		// now render actions
		$.each(getActions(),function(submodule,actors) {
			$.each(actors,function(actor,actions) {
				$.each(actions,function(a,action) {
					//var selector='#actionslist .'+submodule.replace(/ /g,'_')+' .'+actor.replace(/ /g,'_')+' ul';
					//var list=$(selector);
					//console.log([selector,list.length]); //[submodule,actor,'#actionslist > .'+submodule.replace(/ /g,'_')+' > .'+actor.replace(/ /g,'_')+' > ul',]);
					$('#actionslist .'+submodule.replace(/ /g,'_')+' .'+actor.replace(/ /g,'_')+' > ul').append(renderAction(action)); //);
				});
			});
		}); 
		
	});
	
	// FUNCTIONS
	// PERSIST MODULE
	function saveModule() {
		var config={};
		$.each($('#module .moduleconfig'),function(key,value) {
			console.log($(value).val(),$(value).attr('id'));
			//if ($(value).attr('id') && config[$(value).attr('id')])  
			config[$(value).attr('id')]=$(value).val();
		})
		config['bootstrap']=$('#bootstrap').val();
		console.log('saveModule',config);
		localStorage.setItem('module',JSON.stringify(config));
	}
	function loadModule() {
		var config=localStorage.getItem('module');
		if (config !== null)  {
			console.log(['load module',config]);
			config=JSON.parse(config);
			if (typeof config == "object")  {
				$.each($('#module .moduleconfig'),function(key,value) {
					if ($(value).attr('id') && config[$(value).attr('id')]) $(value).val(config[$(value).attr('id')]);
				});
				$('#bootstrap').val(config['bootstrap']);
			}
		}
	}
	// PERSIST ACTIONS
    function saveActions(config) {
		console.log(['save actions',config]);
		localStorage.setItem('actions',JSON.stringify(config));
	}
	function loadActions() {
		var actions=localStorage.getItem('actions');
		console.log(['load actions',actions]);
		if (actions!=null) {
			return JSON.parse(actions);
		} else {
			return {};
		}
	}
	// EXTRACT ACTORS
	function getActors() {
		var actors=$('#actors').val().split("\n");
		// actors
		var tmp=[];
		$.each(actors,function(k,v) {
			var parts=v.split('-');
			var val=parts[0].trim();
			if (val.length>0) tmp.push(val);
		});
		// ensure at least one actor
		if (tmp.length>0) {
			actors=tmp;
		} else {
			actors=["Any"];
		}
		return actors;
	}
	// EXTRACT SUBMODULES
	function getSubmodules() {
		var submodules=$('#submodules').val().split("\n");
		// submodules
		var tmp2=[];
		$.each(submodules,function(k,v) {
			var parts=v.split('-');
			var val=parts[0].trim();
			if (val.length>0) tmp2.push(val);
		});
		submodules=tmp2;
		// add main module
		submodules.unshift("main");
		return submodules;
	}
	
	// EXTRACT ACTIONS AND STEPS
	function getActions() {
		// scrape actions from page
		var actions=scrapeActions();
		
		//console.log(actions);
		// if none available, load from storage
		var tally=0;
		$.each(actions,function() {
			tally++;
		});
		if (tally==0) {
			actions=loadActions();
			//console.log(['loaded ACTIONS',actions]);
		} else {
			//console.log(['scraped ACTIONS',actions]);
		//	saveActions(actions);
		}
		return actions;
	}
	function scrapeActions() {
		var actions={};
		$.each($('#actionslist .submodule'),function() {
			var submodule=$(this)[0].classList[0];
			//console.log(['submodule',submodule]);
			$.each($('.actor',this),function() {
				var actor=$(this)[0].classList[0];
				//console.log(['actor',actor]);
				//console.log($('.action',this).html());
				$.each($('.action',this),function() {
					//console.log('ACTION');
					//console.log(typeof actions[submodule]);
					if (typeof actions[submodule] != 'object') {
						actions[submodule]={};
					}
					//console.log(typeof actions[submodule][actor]);
					if (typeof actions[submodule][actor] != 'object') {
						actions[submodule][actor]=[];
					} 
					var action={};
					action.title=$('input.action-label',this).val();
					action.steps=[];
					$.each($('.step',this),function() {
						var type=$('.step-type',this).val();
						var p1=$('.step-parameter1',this).val();
						var p2=$('.step-parameter2',this).val();
						var p3=$('.step-parameter3',this).val();
						var step={'type':type,'parameter1':p1,'parameter2':p2,'parameter3':p3};
						action.steps.push(step);
					});
					//console.log(action);
					actions[submodule][actor].push(action);
				});
			});
		});
		console.log(['scrape',actions]);
		return actions;
	}
	
	function renderStepTypes() {
		var stepTypes=['go','fillField','selectOption','submitForm','click','grabValueFrom','grabTextFrom',
		'setCookie','grabCookie','seeCookie',
		'see','seeInTitle','seeInField','seeLink','seeElement','seeInCurrentUrl','seeCurrentUrlEquals','seeCurrentUrlMatches','seeCheckboxIsChecked',
		'dontSee','dontSeeInTitle','dontSeeInField','dontSeeLink','dontSeeElement','dontSeeInCurrentUrl','dontSeeCurrentUrlEquals','dontSeeCurrentUrlMatches','dontSeeCheckboxIsChecked',
		'see','seeInTitle','seeLink','seeElement','seeInCurrentUrl','seeCurrentUrlEquals','seeCurrentUrlMatches','seeCheckboxIsChecked',
		'canSee','canSeeInTitle','canSeeInField','canSeeLink','canSeeElement','canSeeInCurrentUrl','canSeeCurrentUrlEquals','canSeeCurrentUrlMatches','canSeeCheckboxIsChecked',
		'cantSee','cantSeeInTitle','cantSeeInField','cantSeeLink','cantSeeElement','cantSeeInCurrentUrl','cantSeeCurrentUrlEquals','cantSeeCurrentUrlMatches','cantSeeCheckboxIsChecked',
		'seeInDatabase','dontSeeInDatabase','haveInDatabase','grabFromDatabase'
		];
		
		var select= '<select class="action-data step-type" >';
		$.each(stepTypes,function(s,stepType) {
			select+='<option>'+stepType+'</option>';
		});
		select+='</select>';
		return select;
	}
		
	function renderStep(step) {
		if (step!=null) {
			var addStep=$('<ul><li class="step" ><input type="submit" value="x" class="deletestep button" >'+renderStepTypes()+'<input type="text" class="action-data step-parameter1"/><input type="text" class="action-data step-parameter2" /><input type="text" class="action-data step-parameter3" /><input type="submit" value="  "  class="wizardsteps button" ></li></ul>');
			if (step.type != null) $('.step-type',addStep).val(step.type); 
			if (step.parameter1 != null) $('.step-parameter1',addStep).val(step.parameter1); 
			if (step.parameter2 != null) $('.step-parameter2',addStep).val(step.parameter2); 
			if (step.parameter3 != null) $('.step-parameter3',addStep).val(step.parameter3); 
			$('.deletestep',addStep).click(function() {
				$(this).parent().remove();
				saveActions(scrapeActions());
			});
			return addStep;
		}
	}
	
	function renderAction(action) {
		if (action!=null) {
			var addStep=$('<input type="button" value="+" class="addstep button" >');
			addStep.click(function() {
				var renderedStep=renderStep({});
				$(this).parent().append(renderedStep);
				$('.action-data',renderedStep).change(function() {
					//console.log(['change',this]);
					saveActions(scrapeActions())
				});
			});
			var title=action.title ? action.title : '';
			var list=$('<li class="action" ><input type="submit" value="x" class="deleteaction button" ><input class="action-label action-data" type="text" value="'+title+'" /></li>');
			$('.deleteaction',list).click(function() {
				$(this).parent().remove();
				saveActions(scrapeActions());
			});
			
			list.append(addStep);
			var wizardAction=$('<input type="submit" value="  "  class="wizardaction button" >');
			wizardAction.click(function() {
				var thisAction=$(this).parent();
				var steps=[{'type':'go'},{'type':'click'},{'type':'fillField'},{'type':'click'},{'type':'see'}];
				$.each(steps,function (s,step) {
					thisAction.append(renderStep(step));
				});
				saveActions(scrapeActions());
			});
			list.append(wizardAction);
			if (action.steps!=null) {
				$.each(action.steps,function(s,step) {
					list.append(renderStep(step));
				});
			}
			$('.action-data',list).change(function() {
				//console.log(['change',this]);
				saveActions(scrapeActions());
			});
			return list;
		}
	}
	
	function renderModulesAndActors() {
		var content='';
		// RENDER NESTED LISTS TO CONTENT
		$.each(getSubmodules(),function(s,submodule) {
			content+="<li class='"+submodule.replace(/ /g,"_")+" submodule' >In the "+submodule+" submodule<ul>";
			$.each(getActors(),function(a,actor) {
				content+="<li class='"+actor.replace(/ /g,"_")+" actor' >"+actor+" user can <input type='submit' value='+' class='addaction button' ><input type='submit' value='  '  class='wizardactions button' ><ul>";
				content+='</ul></li>';
			});
			content+='</ul></li>';
		});
		var contentObject=$(content);
		// EVENT BINDINGS ON THIS NEW CONTENT
		// add action
		$('li input.addaction',contentObject).click(function() {
			//console.log(['new action']); //,renderAction({}));
			var newAction=renderAction({});
			$(this).parent().children('ul').append(newAction);
			//console.log(newAction);
			$('input',newAction).first().focus();
		});
		// wizard action
		$('li input.wizardactions',contentObject).click(function() {
			var thisActionList=$(this).parent();
			var steps=[{'type':'go'},{'type':'click'},{'type':'fillField'},{'type':'click'},{'type':'see'}];
			var actions=[{'title':'search'},{'title':'add'},{'title':'edit'},{'title':'delete'},{'title':'view'}];
			$.each(actions,function (a,action) {
				action.steps=steps.slice();
				thisActionList.append(renderAction(action));
			});
			saveActions(scrapeActions());
		});
		//console.log(getActions());
		return contentObject;
	}
	 
});
  
