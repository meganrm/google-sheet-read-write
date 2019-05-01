const moment = require('moment');

class Page {
    static makeContent(preFix, row) {
        
    }

    constructor(row, index) {

        this.pageId = index;
        this.transition = row['transition'];
        this.layout = row['layout'];
        this.media = {
            mediaId: row['media-id'],
            marker: row['marker'],
            loop: row['loop'] === 'TRUE',
            advanceOnExit: row['advanceOnExit'] === 'TRUE',
        };

        const content = [
            {
                text: row['body-1-text'].trim(),
                element: row['body-1-element'],
                type: row['body-1-type'],
            },
  
        ];
        if (row['body-2-type'] && (row['body-2-text'] | row['body-3-mediaId'])) {
            const newContent = {
                type: row['body-2-type'],
                transition: row['body-2-transition'],
            };
            if (newContent.type == 'text') {
                newContent.text = row['body-2-text'].trim();
                newContent.element = row['body-2-element'];
            } else if (newContent.type == 'media' && row['body-3-mediaId']) {
                newContent.mediaId = row['body-3-mediaId'];
                newContent.element = row['body-2-element'];
                newContent.marker = 'whole-movie';
                if (row['body-2-caption']) {
                    newContent.caption = row['body-2-caption'];
                }
            }
            content.push(newContent);
        }
        if (row['body-3-type']) {
            content.push({
                text: row['body-3-text'],
                transition: row['body-3-transition'],
                element: row['body-3-element'],
                type: row['body-3-type'],

            });
        }
        this.body = {
            transition: row['body-transition'],
            content,
        };
      
    }
}

module.exports = Page;
