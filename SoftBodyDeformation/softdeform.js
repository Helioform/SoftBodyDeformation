var w,h;
var c,ctx;
       
const grav=10;
const numframes=60;
var numprings;
var numparts;
var springs=[];
var parts=[];
var der=[];
var psize;
var t;
var t1;
var dt;
function vect(x,y)
{
   this.x=x;
   this.y=y; 
}
                     
function particle(pos,vel,mass,force,size,fixed)
{
   
    this.pos=pos;
    this.vel=vel;
    this.mass=mass;
    this.force=force;
    this.size=size;
    this.fixed=fixed; // is it moving
}

function derivative(dpdt,dvdt)
{
     this.dpdt=dpdt; // pos derivative which is speed
     this.dvdt=dvdt; // speed derivative which is acceleration 
}

function spring(k,p1,p2,restlength,damping)
{
    this.k=k;         // increase this for more force
    this.p1=p1; // which particle
    this.p2=p2;
    this.restlength=restlength;
    this.damping=damping; // increase this for more resistant spring
}


function calculateForces()
{   
    for(i=0;i<numsprings;i++)
    {
        var p1=springs[i].p1;
        var p2=springs[i].p2;
        var dx=parts[p1].pos.x-parts[p2].pos.x;
        var dy=parts[p1].pos.y-parts[p2].pos.y;
        var l=Math.sqrt(dx*dx+dy*dy);
 
        // calculate force of spring on particles       
        var f=new vect(springs[i].k*(l-springs[i].restlength),
                       springs[i].k*(l-springs[i].restlength));
        f.x+=springs[i].damping*(parts[p1].vel.x-parts[p2].vel.x)*(dx/l);
        f.x*=-(dx/l);
        
        f.y+=springs[i].damping*(parts[p1].vel.y-parts[p2].vel.y)*(dy/l);
        f.y*=-(dy/l);
        
        // Calculate gravitational attraction
        var l2=l*l;
        var gm1m2=grav*parts[p1].mass*parts[p2].mass;
        gm1m2/=(l2*l);
        
  //      f.x+=dx*gm1m2;
  //       f.y+=dy*gm1m2;
        
        if(!parts[p1].fixed)
        {    
            parts[p1].force.x+=f.x;
            parts[p1].force.y+=f.y;
        }
         // apply inverse force
        if(!parts[p2].fixed)
        {
            parts[p2].force.x-=f.x;
            parts[p2].force.y-=f.y;
        }           
        
    }    
}

function calculateDerivatives()
{
     for(i=0;i<numparts;i++)
     {
         der[i].dpdt.x=parts[i].vel.x;
         der[i].dpdt.y=parts[i].vel.y;
         // Uses Newton law f=ma
         der[i].dvdt.x=parts[i].force.x/parts[i].mass;
         der[i].dvdt.y=parts[i].force.y/parts[i].mass;
         
     }
}

function updateParticles()
{
    calculateForces();
    calculateDerivatives();
    
    // apply derivative
    for(i=0;i<numparts;i++)
    {
         parts[i].pos.x+=der[i].dpdt.x*dt;
         parts[i].pos.y+=der[i].dpdt.y*dt;
         parts[i].vel.x+=der[i].dvdt.x*dt;
         parts[i].vel.y+=der[i].dvdt.y*dt;   
    }
}


function rand(min,max)
{
   return (Math.random()*(max-min)+min); 
}

function randEither(a,b)
{
    var r=Math.random();
    return (r>=0.5?a:b);
}

window.addEventListener('load', function()
{                     
    init();
    setInterval(sysLoop,1000/numframes);
});
        
function init()
{
    c=document.querySelector("canvas");
    ctx=c.getContext('2d');
    c.width=window.innerWidth;
    c.height=window.innerHeight;
    w=c.width;
    h=c.height;
    psize=10;
    setupSystem(15,15);
}

function changeParticleSize()
{
    var n=prompt("Enter particle size:");
    if(n<1)
       alert("Enter a number greater or equal to 1");
    else
    { 
       psize=n;
    }
    
}
function changeNumberOfParticles()
{
   var n = prompt("Enter number of particles:");
   if(n<2)
       alert("Enter a number greater than 1.");
  else
      setupSystem(n,n);
      
}

function changeConstant()
{
    var f=prompt("Enter spring coefficient:");
    for(i=0;i<numsprings;i++)
        springs[i].k=f;
        
}

function changeDamping()
{
    var f=prompt("Enter spring damping:");
    for(i=0;i<numsprings;i++)
         springs[i].damping=f;
         
}

function changeRestLength()
{
    var f=prompt("Enter spring rest length:");
    
    for(i=0;i<numsprings;i++)
        springs[i].restlength=f;
        
}


function setupSystem(nums,nump)
{
    numsprings=nums;
    numparts=nump;
    springs=new Array(nums);
    parts=new Array(nump);
    der=new Array(nump);
    createSprings();
    createParticles();
    t=t1=dt=0;
}
    
function createSprings()    
{
    for(i=0;i<numsprings;i++)
        springs[i]=new spring(rand(0.05,1),0,0,0,10);
}    

function createParticles()
{
    for(i=0;i<numparts;i++)
    {
        // create particles in a circular fashion
        var x = (w/2)*Math.cos(i*2*Math.PI/numparts)+w/2;
        var y = (w/2)*Math.sin(i*2*Math.PI/numparts)+h/2;
        parts[i]=new particle(new vect(x,y),new vect(0,0),10,new vect(0,0),psize,false);
        var x2=(w/2)*Math.cos((i+1)*2*Math.PI/numparts)+w/2;
        var y2=(w/2)*Math.sin((i+1)*2*Math.PI/numparts)+h/2;
        var dx=x2-x;
        var dy=y2-y;
        var l = Math.sqrt(dx*dx+dy*dy);
        springs[i].restlength=rand(l/10,l/5);
    }
    
    // associate parts to springs 
    for(i=0;i<numsprings-1;i++)
    {
        springs[i].p1=i;
        springs[i].p2=i+1;
    } 
    
    springs[numsprings-1].p1=numsprings-1;
    springs[numsprings-1].p2=0;
 
    for(i=0;i<numparts;i++)
       der[i]=new derivative(new vect(0,0),new vect(0,0));
}

function debugOutput(s)
{
   ctx.font="20px Georgia";
   ctx.fillStyle="Gray";
   ctx.fillText(s,100,100); 
   
}
function drawLine(x1,y1,x2,y2)
{
    ctx.strokeStyle="rgba(0,0,255,0.3)";
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();      
}

function drawCircle(x,y,r)
{
    ctx.fillStyle="rgba(255,0,0,0.3)";
    ctx.beginPath();
    ctx.arc(x,y,r,0,2*Math.PI); 
    ctx.fill();
}

function drawParticles()
{
    for(i=0;i<numparts;i++)       drawCircle(parts[i].pos.x,parts[i].pos.y,psize);
        
    for(i=0;i<numparts-1;i++)       drawLine(parts[i].pos.x,parts[i].pos.y,parts[i+1].pos.x,parts[i+1].pos.y);
        
     drawLine(parts[numparts-1].pos.x,parts[numparts-1].pos.y, parts[0].pos.x,parts[0].pos.y);
}

function startSystem()
{
    setupSystem(numsprings,numparts);
}

function processSystem()
{
    updateParticles();     
}

function sysLoop()
{
    t1=t;
    processSystem();
    draw();
    t+=0.025;
    if(t>=10) // reset system to avoid explosion if t too large
      setupSystem(numsprings, numparts);
    else
      dt=t-t1;
}

function draw()
{   
    ctx.clearRect(0,0,w,h);
    drawParticles();
}
    