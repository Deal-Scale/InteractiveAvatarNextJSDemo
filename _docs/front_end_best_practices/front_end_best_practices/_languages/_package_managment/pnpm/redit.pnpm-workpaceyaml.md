https://www.reddit.com/r/pnpm/comments/1k943qb/best_practices/

Skip to main content
best practices : r/pnpm

    


  
  
  
  
  
  
  
  
  
  
  
  




  
  
  
  
  
  



  
  
  
  



  
  
  
  















  
Create
Create post
Open inbox
r/pnpm icon
Go to pnpm
r/pnpm
•
8 days ago
AShaheen92
best practices

is it best practice to remove all pnpm configuration settings from .npmrc to pnpm-workspace.yaml as the new docs replaced Settings (.npmrc) with Settings (pnpm-workspace.yaml) and now all settings are named in camelCase instead of kabab-case which makes me go to old docs for naming and confuses me about what works in .npmrc and pnpm-workspace.yaml and what does not work in .npmrc but works in pnpm-workspace.yaml
eg: node-linker -> nodeLinker
I want to add that I am not annoyed by any changes I just want to follow best practices
Sort by:
zkochan
•
7d ago

Yes, move all the settings to pnpm-workspace.yaml except those related to auth, like the auth token
AShaheen92
•
7d ago

Thanks
Top 33%
Rank by size
Created Nov 8, 2019
Public
Moderators
Message Mods

    u/zkochan
    Zoli

View all moderators
Reddit Rules Privacy Policy User Agreement Reddit, Inc. © 2025. All rights reserved.

    