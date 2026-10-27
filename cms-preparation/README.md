# Editing Scheed Cole's website

This draft editor uses Pages CMS and the `cms-content-preparation` GitHub branch. It has not yet been merged into the live site. Do not edit the main branch with this editor until integration is reviewed and completed.

Open https://app.pagescms.org/, sign in with an authorized GitHub account, choose the Scheed Cole repository and select the intended branch. Content sections are Home, Work listings and Press listings.

## Home
Choose Home, edit the text and select Save. The practice statement is plain text; editing it can remove the original italic emphasis.

## Work
Open Work listings and expand an entry by its title. Edit the listing text or choose a photo. For existing project pages, use the separate project-page heading, introduction and main-photo fields. Other custom stories, galleries and statistics on those pages are not editable in this version and remain intact. Existing page paths are technical fields and should be preserved.

To add a project, choose Add an item, enter the title, location, type, description and photograph, then save. A basic project page is generated automatically if the existing-page field is blank. Keep the generated Project ID unchanged; it keeps the new project's link stable. New projects currently support one cover image and a short description, not a gallery or custom case study.

## Press
Open Press listings to add or remove an article. Use a complete https:// link, enter a publication and display date, and use YYYY-MM-DD for sorting when known. These entries control the main Press page. Project-specific press pages remain separate and do not update automatically.

## Publishing and access
Saving commits to the selected GitHub branch. Only changes made to the branch configured for GitHub Pages can appear on the public website, after deployment completes. Verify the correct branch before saving. Public visitors need JavaScript for updated content; the original HTML remains as a fallback. Give each editor their own appropriate repository access; avoid sharing credentials.

## Tests completed on the protected preview
Home text editing, adding a project with an existing library photo, a new project page, adding a press link, editing an existing project-page introduction, saving removal of a disposable press entry, and uploading a disposable image were tested. Temporary test entries and the test image were removed. Initial content was checked against the existing 12 project listings and 63 press links.

## Remaining before handover
Review mobile layouts, connect the editor to the final publication branch, and verify one controlled end-to-end edit against GitHub Pages. Confirm whether project-specific press pages and additional project text or galleries should be editable. Shop and payments are future work.
