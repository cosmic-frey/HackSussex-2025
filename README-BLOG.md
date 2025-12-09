# I'm A HackSussex GameJam Winner??!!??
Soooo we won three categories?? Mental! This was my first in person hackathon, our first Hackathon as a team, and my teammates first EVER Hackathon, and really we were just aiming to win something (even if it was The Hackiest Hack). Over the month of November I began familiarising myself with Javascript, as I felt this familiarity could be helpful in the future. I did not, however, predict that this decision would result in winning my fist Hackathon - especially as a two-person team (we'll get onto that later). 

![image](https://github.com/cosmic-frey/HackSussex-2025-Winning-Game/blob/main/password%20quest%20stills/winning%20devpost.png)

**This is an informal blog-style README. I will be adding a more proffessional one later (similar to our Devpost submission), but I thought it would be best to document the process of making Password Quest whilst it was still fresh in my mind. I also want this as something to look back on, because I was in shock for two days after winning and the weekend went by in a blur.    
If you can't tell, I am sososososoo thankful and I can't wait to start my next project!**   
  
## The Other Entries:
Before I get started, I want to highlight the other amazing entries. Check out all the other amazing entries in the Devpost link below:
[https://hacksussex-gamejam-2025.devpost.com/project-gallery]



## The Game - Password Quest:

We created a Multi-level 2D game using Javascript (phaser.js) in vscode, which followed our magical protagonist on a quest to defeat the dragon who stole his personal data. Our end product was a working game we named Password Quest, which included a narrated intro-video and narrated outro-page (we used ElevenLabs for all audio, including narration).
   
Password Quest investigated themes of personal privacy, shadow threats and the importance of altruism in internet safety, winning three prize categories in total from two awarding bodies.  

## The Winning Categories:
These winning categories were:
- The BCS Chartered Institute for IT Prize for best game investigating themes of internet safety
- The Major League Hacking Prize for best use of Auth0
- The Major League Hacking Prize for best use of Vultr

### Judging Criteria for the Categories we won:
- **BCS Chartered Institute for IT:**
  - Intuitive Design and ease of use - "Is the game easy to pick up?" **(10 points)**
  - Thematic impact: Online Safety - "Does it incorporate the theme of digital shadows/safety?" **(10 points)**
  - Innovation and Mechanics - "How creatively are mechanics used for invisible/hidden?" **(10 points)**
  - Technical Excellence and Robustness - "Quality - is the solution technically sound?" **(10 points)**
  - Ethical Design and Inclusivity - "Social responsibility, Does the solution consider wider impact?" **(10 points)**

- **MLH Best Use of Auth0:**
  - The best game that makes a login with Auth0 wins!

- **MLH Best Use of Vultr:**
  - The best game that is deployed to the cloud with Vultr wins!
   
## Game structure - Password Quest:  
(This is a written breakdown of our game structure, including video game stills for visual learners.)  
   
**1) Intro-Video:**    
The intro video sets the scene for the plot. To make this we used AI generated art that we pixelised for the opening scene, Canva, Piskel (for the dragon and crying scene) and ElevenLabs for the narration and background music.    
![image](https://github.com/cosmic-frey/HackSussex-2025-Winning-Game/blob/main/password%20quest%20stills/intro%20video.png)   

**Loading Screen:**    
![image](https://github.com/cosmic-frey/HackSussex-2025-Winning-Game/blob/main/password%20quest%20stills/loading%20screen.png)
   
**2) Concept:**     
You need to collect Password tokens (coins) in order to defeat the dragon at the final level. There are elements of the first two levels that will try to stop you from achieving this. The game has setting split into Easy, Medium and Hard for all three levels (i.e. if Easy is chosen at the beginning, then all levels (1, 2 and 3) will be in Easy mode unless the game is restarted and a new mode is selected).   
![image](https://github.com/cosmic-frey/HackSussex-2025-Winning-Game/blob/main/password%20quest%20stills/game%20intro.png)
 
**3) Level 1:**   
Level 1 was set up as a moving platformer, and the aim of this level was to collect as many Password tokens (coins) as possible, and avoid colliding with shadow threats by casting spells to explode them (as they will steal your password tokens) in 60 seconds. This level is made harder in Medium and Hard by the platform speed increasing, the fixed probability of a shadow threat appearing over a set time period increasing, and the time period for the probability of a shadow threat appearing decreasing (more periods in 60 seconds = more likely).   
![image](https://github.com/cosmic-frey/HackSussex-2025-Winning-Game/blob/main/password%20quest%20stills/level%201%20intro.png)
![image](https://github.com/cosmic-frey/HackSussex-2025-Winning-Game/blob/main/password%20quest%20stills/level%201%20game.png)
   
**4) Level 2:**   
This level is based around the importance of **altruism.** Level 2 is based around flappy bird mechanics (called 'tap to fly' in Phaser for Desktop) and lasts 45 seconds. The aim to collect Password tokens (coins) is still the same in Level 2, however you need to collect warning signals in order to take these tokens into Level 3. Collecting a warning token means that you are warning people back home that your personal data has been compromised, which is important as this can help them protect their own data too. If you collide with a shadow threat, you lose all coins and warning signals collected so far in Level 2 and fall to the bottom of the page - so you need to collect more quickly before the time runs out! This level is made harder in Medium and Hard modes by the screen scrolling faster (like in Level 1) and the density of shadow threats increasing (so they are harder to avoid).   
![image](https://github.com/cosmic-frey/HackSussex-2025-Winning-Game/blob/main/password%20quest%20stills/level%202%20intro.png)
![image](https://github.com/cosmic-frey/HackSussex-2025-Winning-Game/blob/main/password%20quest%20stills/level%202%20game.png)
   
**5) Level 3:**   
This is The Boss Fight Level. The more warning signals you collect in Level 2, the more spells you have in reserve. The protagonist stands on one platform and the dragon stands on the other. Each take turns taking two shots at the other, the protagonist uses magic to attack and the dragon uses fire balls to attack (both based off the same particle system as in Level 1). You can jump to avoid being hit (currently the physics for jumping needs to be fixed for the Easy mode as it is quite hard), and so can the dragon! The probability that the dragon successfully avoids being hit increases in Medium and Hard modes.    
![image](https://github.com/cosmic-frey/HackSussex-2025-Winning-Game/blob/main/password%20quest%20stills/level%203%20intro.png)
![image](https://github.com/cosmic-frey/HackSussex-2025-Winning-Game/blob/main/password%20quest%20stills/level%203%20game.png)

**Fight Dynamics - Protagonist:**   
![image](https://github.com/cosmic-frey/HackSussex-2025-Winning-Game/blob/main/password%20quest%20stills/level%203%20fight%20dynamics%20(protagonist).png)    
**Fight Dynamics - Dragon:**   
![image](https://github.com/cosmic-frey/HackSussex-2025-Winning-Game/blob/main/password%20quest%20stills/level%203%20fight%20dynamics%20(dragon).png)
   
**6) Scoring:**    
Your score is calculated by the total number of coins you collect divided by the time it takes you to defeat the dragon. These scores are seperated by mode so that a higher score in Easy mode doesn't trump an equally impressive score in Medium/Hard mode.     
   
**7) Educational End-screen:**   
When you defeat the dragon, you are given your overall score and taken to an end screen. The educational end screen contains links to a variety of online resources related to online safety and phishing scams from reputable UK institutions (including a variety for children/young people, families, working professionals, adults and the elderly). This end-screen is Narrated by the same narrator as the intro-video, and rounds off your victory by warning you of the dangers of phishing scams in the real world and highlighting the links on the page to encourage you to learn more.     


## How Tasks were split-up:
Initially we were supposed to be part of a larger team. However, pessimistically I dreamt that this all went wrong the night before (I hate having prophetic dreams the night before a big deadline), so I readied myself for this eventuality. Our other two teammates had uni deadlines (which is so valid, I feel for anyone who has January exams), and my teammate (Jabez, one of my closest friends from Sixth Form) had committments in the evening which were to watch his flatmate in a performace and sleep 6-9 hours (both valid and I would have done the same in his position, I did regret onl sleeping 4-5 hours the following Monday).   
   
This did complicate the division of tasks, as many of these timings were unknown, so - we decided to do something **bold** (and somewhat rash):
- I (The **Biologist**) would work on the logic
- My teammate (The **Theoretical Physicist**) would work on the graphics and anything else he had time for.
This put both of us majorly out of our comfort zones, and also forced us to engage in "valuable learning opportunities" (helpful as this was one of the judging criteria).

I have a tendency to over-reach in projects and not get them finished (never take me to pottery painting it will be the most stressful experience of your life), so I made sure we entered this competition with a simplicity-focussed mindset (which went out of the window a little bit when things started going a bit too well - I'm too much of an over-achiever). This simplicity was helpful as it focussed the initial stages of work so that we had something playable by the first evening (Level 1).   
   

## The Decision-making Process:
**So: Why Phaser? Why Javascript?**

This was actually a whole crisis I had when researching ways to make video games. I knew what scratch was and I know how to make noughts and crosses with C++ (kinda) and... well that was about it to be honest.   

### Why not Python?
Initially I wanted to make a game using Pygame. I downloaded the Al Sweigart book "Making games with Python & Pygame", watched youtube videos, read through demos, worked through mini-projects in codex.io - then I actually looked at previous winning submissions from 2024 and 2023. None of them used Python. This set off some warning bells and I started watching videos of people talking about making winning games for hackathons and why Pygame did not work. Turns out it's slow, prone to crashing, the errors are hard to work through, and there's a limit to the technical effects you can utilise. Additionally, one of the blogs I read talked about how bad pygame had been at a hackathon, and how they had to learn to use Unity and make a new game in six hours. This did not sound ideal, and I fear I may have cried if that happened to me.  

### Why not Godot?   
This was the crisis I had the evening before the competition. I have some friends who are starting their own video game business- what are they using? Godot. Everyone seems to be using it, so it must be good....right? That's what I presumed initially too. It looked like an amazing way to make a game where you got visual output immediately, PLUS godscript is similar to Python so this seemed like a huge win (maybe my teammate could help with the code afterall!). However, I have trust issues (at a healthy level I promise), so I initiated a deep dive into why Godot may be a bad idea. Initially, I couldnt find anything obvious, so I started watching tutorial videos and worked demos of how a game can be made. Through watching these videos, something stuck out for me immediately - all the processes involved seemed so interconnected and dependent on one another. This scared me a bit as, although obviously I'm awesome at coding, I'm also very new and I knew that I would be making a lot of mistakes throughout this competition - the last thing I wanted was for one little syntax error to ruin everything. 

### Why Phaser:
Whilst using my partner as a rubber duck to talk this through (thanks Steve), I realised that what I really wanted was a language where everything is spaced out seperately in a clear and organised way - just like my Tamaghosty project!. But - Javascript is just for front-end, you can't make games with it... right???   
   
Yeah so turns out (through asking GitHub copilot if you can make a game with Javascript) that Phaser very much exists (my newbie-ness shining through, I promise I'm learning). On the train ride to Brighton (I got up at 5:30am to arrive at 9:15am) I researched as much as I could about Phaser. At that point I was about 60% sure we were going to use Phaser, but I needed to make sure that the pros outweighed the cons. The shear amount of content and resources for Phaser, and asking my teammate for his opinion after laying out the pros and cons swayed me to make the final decision.   

## The Planning Process:
I took down physical notes in the opening ceremony, and took photos of word-heavy slides (this was helpful as only one of the presentations were posted on the Discord). The MLH judging criteria, so we had a rough idea of what software we could implement in our project and what prizes they led to, but the additional judging criteria (for the HackSussex Theme, Hackathons UK and BCS Chartered Institute for IT) was new to us.    
    
After installing all our packages (see the 'Challenges' section for details as to why this stage took so long), implementing the basic backbone of our code (with the help of resources supplied by Phaser for Desktop), and making initial loading screens, we got to work brainstorming on paper. We knew that we wanted to make something fun and narrative, and we knew that we had to keep it simple. The initial idea was that we would make two levels (what is now Level 1 and Level 3) and if we had time we would add an extra level (what is now Level 2), and the story of Mushy (our magical mushroom protagonist) developed very quickly alongside rough sketches of movement dynamics in the game.    

We broke down every stage of the development process and turned these broken-down tasks into to-do lists, so that our plans didn't get too complicated or overwhelming. These to-do lists were updated and amended regularly in response to new ideas or issues, and were placed between us on the table so that we could quickly glance down and see where each of us were in the creation process. In addition to this, I also took notes on paper throughout the competition (as I find this helps me learn and think quicker than typing my notes), detailing the logic of any physics/mechanics that proved to be more complicated than initially anticipated, and noting down what formatting worked and what didn't. 

## Why Phaser Worked:
Obviously I used a lot of resources, and could not have completed this project without access to the internet and GitHub copilot (AI) to streamline our process. Phaser (as I already may have mentioned) has so many open-source resources, and so many examples of how to implement code for different features. For someone who needs to work visually and see how code is implemented, these examples were a godsend. I have linked below every webpage I used to find resources and worked examples of code, however I also used the examples within the windows launcher for Phaser (files for these examples and labelled trial in my repo). 
   
### Helpful Resources for Phaser:
- Making your first Phaser game (parts 1-10): [https://phaser.io/tutorials/making-your-first-phaser-3-game/part1]
- Getting started with Phaser: [https://docs.phaser.io/phaser/getting-started/what-is-phaser]
- Used as a reference for what should be in my GitHub Repository: [https://github.com/ourcade/phaser3-vite-template]
- Particle Effects: [https://docs.phaser.io/phaser/concepts/gameobjects/particles]
- So many effects (also amazing particle-effect examples): [https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/]
- Helpful for game objects (and particle-effects...again): [https://deepwiki.com/phaserjs/phaser/4.3-particle-systems]
- Fire effects: [https://phaser.io/examples/v3.85.0/game-objects/particle-emitter/view/fire-effects]
- Gravity Processor (super cool magic effect!): [https://phaser.io/examples/v3.85.0/game-objects/particle-emitter/view/gravity-processor]
- Snaking-line glittery magic effect: [https://phaser.io/examples/v3.85.0/game-objects/particle-emitter/view/interpolation-ease]
- Flare-Effects: [https://phaser.io/examples/v3.85.0/game-objects/particle-emitter/view/emit-zone-loop]
- Space Raiders shooting effect (helpful for gravity-informed attacks/shooting): [https://phaser.io/examples/v3.85.0/game-objects/particle-emitter/view/emit-zone-loop]
- Health Bars for fights/battles: [https://phaser.io/examples/v3.85.0/game-objects/graphics/view/health-bars-demo]
- Adding effects to objects (detailed guide): [https://help-v3.phasereditor2d.com/scene-editor/shader-effects-add-fx.html]
- Decribing the process of making a lava platformer (I was more interested in the physics): [https://codepal.ai/chat/query/RnJxvdLY/build-a-lava-platformer-game-with-phaser]
- Super detailed guides on making platformer games in Phaser: [https://digitherium.com/blog/category/platformer-series/]
- Making Layered backgrounds: [https://www.joshmorony.com/how-to-create-a-parallax-background-in-phaser/]
- Using images: [https://docs.phaser.io/phaser/concepts/gameobjects/image]
- Shooting from a point: [https://phaser.io/examples/v3.85.0/physics/arcade/view/velocity-from-angle]
- Collecting objects: [https://medium.com/@alizah.lalani/collecting-objects-in-phaser-3-platformer-games-using-tiled-4e9298cbfc85]
- Helpful for collisions: [https://www.lessmilk.com/phaser-game-tutorial/]
- Phaser for Desktop, helpful demos for game dynamics (eg: tap to fly/flappy bird mechanics): [https://phaser.io/download]


## Use of AI:   
AI is a great tool for learning, and helps to streamline a project under time pressure. I am very open about my use of AI as a learning tool, and AI helped me a lot over the past month in familiarising myself with Javascript.   
   
### What AI was helpful for:
- Adding comments (My teammate did not know Javascript and there would not have been enough time for me to add comments for every block of code I wrote in the 24hour period)
- Summarising the work I had done so far in an .md for me to refer back to after taking breaks (toilet break, lunch break, chat break, walk break, sleep, etc)
- Writing up instructions of ways I could implement changes as .md files, and answering questions I had on these potential changes.
- Explaining why my code was not running (it's hard to get into the flow of Javascript syntax, and as I'm new to it I still regularly make mistakes - which is how you learn!)
- Explaining code errors (what they mean, how they could be fixed, and what I did to cause the error)
- Suggesting fixes/ debugging ideas (I'm very new to debugging and this was the first time I properly focussed on learning to debug in console, which was very exciting!)
- Rearranging my code blocks if I had put them in the wrong sequence (turns out AI can often be just as bad as me at this, but it can be helpful sometimes nonetheless)
- Writing up instructions of how to use Auth0, Cloudflare, Vultr and ElevenLabs (so I didn't have to waste time googling in the last 30 mins)


## Challenges we ran into:
### We forgot to reload Powershell for two hours, so we thought packages hadn't installed properly:
Evident from the sub-heading. Two. Full. Hours. Time I could have used later to fix our my backend bugs. This was a learning opportunity, because sometimes the problems that pop up are because you've overlooked the 'easy' steps. 

### I still don't quite understand why I kept getting a node.js audit error, but ignoring it worked fine:
This is something I need to look into, my code worked fine but I do need to run an audit check.

### I kept breaking the intro-video:
Integrating audio with video clips, directly in Javascript, is so much harder than adding in sound effects for actions or effects. Initially I wanted to make the video in Canva (along with the audio) then just load it for the intro-video. However, the loading of video clips was far too delayed and would cut off the audio/video or the audio and video would load seperately and un-sync. This was even a problem for shorter clips, so the video scenes had to be compiled/made directly in Javascript. I got a weird bug in rendering the Mushroom_cry sprite, where a blue bar appeared above (there is no blue in the line above this sprite sheet, I still don't know how to fix this).

### The physics kept going wrong in Level 1:  
Level 1 took the longest amount of time to make (nearly all of day 1, 12pm - 10pm).  

### Coin-counting kept multiplying instead of adding and it made me cry:

### I kept breaking level 2:

### I managed to fix the flames in Level 3 by accident?
The flame demo from Phaser.io (linked in resources) looked so cool, and I wanted to implement it in the Boss Fight in Level 3.

### Jumping mechanics are actually a nightmare that I still need to fix:
Something kept happening that kept taking away the double-jump dynamic I had coded in initially for Level 1, and subsequently affected the jump dynamic to dodge in Level 3. This wasn't a major problem, as even if you only dodged 50% of the time in Level 3, you still beat the dragon - however this may pose greater issues in Medium and Hard modes that it does in the Easy mode. 

### Backend is actually really hard:
Having avoided needing to ask for help, a member of the team who's game got banned helped me in the last few minutes of submission when all my backend code broke, I couldn't make my URL work, and I was about to cry. The speed they went through my checks was off the charts, and although they couldn't help me fix whatever I did wrong with the backend code, they helped me with the mistake I had made with creating my URL, and also introduced me to GitHub Desktop (which embarassingly I didn't know existed). I am so thankful for how helpful people were at this event, and how good they were at explaining problems.   

There are still some backend bugs I need to fix. These fixes will happen gradually over the next few weeks/months (I'm in my final year of university at the moment). Debugging through the console has been a game changer, and it's also helpful for returning to a project (as I find this method acts as comments for errors).




  





