
$(function() {


			// встановлення елементів інтерфейсу
			function setInterface(){
					// приховування/відображення вкладених віддзеркалень, що виходять 
					// за рамки проекції 
					$("#hideOverflowButton").on("click",function () {
						$(".mirror").css({
							"overflow":"hidden"
						});
					});

					$("#showOverflowButton").on("click",function () {
						$(".mirror").css({
							"overflow":"visible"
						});
					});

					// скидання кутів нахилу дзеркала
					$("#resetButton").on("click",function () {
						currentXRotation=0;
						currentYRotation=0;
					    $(".mirror").css({
								"transform": "rotateX("+currentXRotation+"deg)  rotateY("+currentYRotation+"deg)  translateZ("+currentTranslate+"px)"
						});

					});

					
					// віддалення наближення дзеркала від площини проекції
					$(window).bind('mousewheel',function (event) {
						if (event.originalEvent.wheelDelta >= 0) {
							//заборонимо виступати за рамки площини проекції
							if(currentTranslate<-5) currentTranslate+=2;
					    }
					    else {
					        currentTranslate-=2;
					    }

					    $(".mirror").css({
		  					"transform": "rotateX("+currentXRotation+"deg)  rotateY("+currentYRotation+"deg)  translateZ("+currentTranslate+"px)"
		  				});
					});	

					// керування кутами нахилу дзеркала за допомогою клавіш навігації
					$(document).keydown(function(e) {
				    		     
				    	var key=e.which;

				    	if(key===40) currentXRotation>0?currentXRotation-=1:currentXRotation=360;		    			    	
				    	if(key===38) currentXRotation<358?currentXRotation+=1:currentXRotation=0;		    			    
				    	if(key===39) currentYRotation>0?currentYRotation-=1:currentYRotation=360;		    			    	
				    	if(key===37) currentYRotation<358?currentYRotation+=1:currentYRotation=0;		    			    	

		 		    		$(".mirror").css({		  					
				  					"transform": "rotateX("+currentXRotation+"deg) rotateY("+currentYRotation+"deg) translateZ("+currentTranslate+"px)"
				  			});		  					


				    	e.preventDefault(); 
					});

			}

			// функція віддзеркалення об’єкту
			function reflect (reflectedObject) {

				// визначаємо ім’я класу поточного об’єкту, за яким буде здійснюватись його відслідковування
				var currentCloneClass=""+$(reflectedObject.obj).attr("id")+"Cloned";

				//якщо об’єкт наблизився до центру дзеркала на розмір його сторони
				if(Math.abs(reflectedObject.x-mirrorObject.middle.x)<($(".mirror").width()) &&
						Math.abs(reflectedObject.y-mirrorObject.middle.y)<($(".mirror").height())){
							
							// визначаємо позицію об’єкту на площині відображення
							var cloneObjctLeft=reflectedObject.x-mirrorObject.x - $(reflectedObject.obj).width()/2;
							var cloneObjctTop=reflectedObject.y-mirrorObject.y - $(reflectedObject.obj).height()/2;													

							// якщо об’єкт ще не було додано до площини відображення
							if(!$("."+currentCloneClass).length){
								// створюємо клон об’єкту 
								var objectClone=$(reflectedObject.obj).clone();
								// додаємо до нього клас відслідковування
								$(objectClone).addClass(currentCloneClass);
								//задаємо його позицію на площині віддзеркалення
								$(objectClone).css({
									left:""+cloneObjctLeft+"px",
									top:""+cloneObjctTop+"px"
								});
								// додаємо "віддзеркалення об’єкту на всю глибину вкладених дзеркал"
								for(var i=0;i<mirrDivs.length;i++){											
										var newClone=objectClone.clone();
										//кожне друге віддзеркалення обертаємо на 180 градусів
										if(i%2===0) $(newClone).toggleClass("flipped");																			
										$(mirrDivs[i]).append(newClone);
								}
							} else{							
								//якщо об’єкт вже "віддзеркалюється - просто змінюємо його позицію"
								$("."+currentCloneClass).css({
										left:""+cloneObjctLeft+"px",
										top:""+cloneObjctTop+"px"
								});
							}
					}else{
						// якщо об’єкт недостатньо наближений до центру дзеркала - видаляємо його віддзеркалення
						$("."+currentCloneClass).remove();
					}

			}

			// функція наповнення дзеркала вглиб
			function createMirror(mirrors,depth){
					for(var i=1;i<depth;i++){
						var div=jQuery('<div class="mirror"/>');
						div.html("<div class='label'>MIRROR</div>");
						mirrors[i]=div;
						mirrors[i-1].append(div);
					}
			}


			setInterface();		

			// встановлюємо центр екрану
			var middle={
				x:$(window).width()/2,
				y:$(window).height()/2
			};

			var mirrorObject={
				middle:{}
			};


			var currentTranslate=-100;
			var currentYRotation=0;
			var currentXRotation=0;

			var mirrDivs=[];
			mirrDivs[0]=$("#firstMirror"); 
			

			createMirror(mirrDivs,20);			

			// додаємо дзеркалу переміщуваність
			$( "#firstMirror" ).draggable({  		
					// відслідковуємо подію переміщення
					drag: function( event, ui ) {

					// визначаємо координати дзеркала
					mirrorObject.middle.x=ui.offset.left+($(this).width()/2);
					mirrorObject.middle.y=ui.offset.top+($(this).height()/2); 	
					mirrorObject.x=ui.offset.left;
					mirrorObject.y=ui.offset.top;

					// визначаємо зсув центру дзеркала відносно центру екрану
					var deltaX=(middle.x-mirrorObject.middle.x);
					var deltaY=(middle.y-mirrorObject.middle.y);
					// визначаємо попередній зсув у відсотках від розмірів дзеркала
					var percentageX=50+(100*deltaX/$(this).width());
					var percentageY=50+(100*deltaY/$(this).height());

					// переміщуємо центр збігання проекції дзеркала на величину зсуву
					$(".mirror").css({
								"perspective-origin": ""+(percentageX)+"% "+(percentageY)+"%"  					
						});

						// оновлюємо віддзеркалення всіх об’єктів
						for(var i in reflectedObjects){
							reflect(reflectedObjects[i]);
						}

					}
			});


			//відслідковуємо переміщення віддзералюваних об’єктів
			var reflectedObjects={};

			$(".reflectable").draggable({		  		
		  		drag:function (event, ui) {
  					reflectedObjects[$(this).attr("id")]={
  						obj:this,
						x:ui.offset.left+($(this).width()/2),
						y:ui.offset.top+($(this).height()/2)
  					};  	
  					// оновлюємо віддзеркалення поточного об’єкту
					reflect(reflectedObjects[$(this).attr("id")]);
		  		}
			});
  });