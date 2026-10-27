# Editing Scheed Cole's website

The draft editor uses Pages CMS and the `cms-content-preparation` GitHub branch. It has not yet been merged into the live site. Do not edit the main branch with this editor until integration is reviewed and completed.

Open https://app.pagescms.org/, sign in with the authorized GitHub account, choose the Scheed Cole repository and select the appropriate branch. Content sections are Home, Work listings and Press listings.

## Home
Choose Home, edit the text you want to change and select Save. The practice statement is plain text; changing it currently removes the original italic emphasis.

## Work
Open Work listings and expand an entry by its title. Edit its listing text or use the photo picker. To add a project, choose Add an item, fill in the title, description, location and image, and save. A basic project page is generated automatically if no existing page path is given. Keep the generated Project ID unchanged; it keeps the new project's link stable. A new project's description is shared by its listing and its new page. Existing projects retain their individually designed HTML pages; edits to their listing do not update the content inside those individual pages. Existing page paths are technical fields and should be preserved.

## Press
Open Press listings to add an article or update or remove an existing entry. Use a complete https:// link. Provide the publication and display date; use YYYY-MM-DD in the sorting field when known. These entries control the main Press page. Project-specific press pages currently remain separate and do not update automatically.

## Publishing
Saving commits to the currently selected GitHub branch. Only changes made to the branch configured for GitHub Pages can appear on the public website, after its deployment completes. Verify the correct branch before saving. Public visitors need JavaScript for the updated content; the HTML retains the original content as a fallback.

## Validation and limits
The Home text, a new project with an existing image, and a new press link were saved through Pages CMS and observed on the protected Vercel preview; temporary entries were removed. New projects currently support one cover image and a basic description, not a gallery or full custom case study. Images selected from the media library have been tested; uploading new images, removal via the CMS, mobile layouts, simultaneous edits and live GitHub Pages publishing still need end-to-end tests. Shop and payments are separate future work.
