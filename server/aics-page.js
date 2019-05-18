class Page {
    static makeContent(preFix, row) {
        if (row[`${preFix}-type`] && (row[`${preFix}-text`] || row[`${preFix}-mediaId`])) {
            const newContent = {
                type: row[`${preFix}-type`],
                transition: row[`${preFix}-transition`],
            };
            if (newContent.type == 'text') {
                newContent.text = row[`${preFix}-text`].trim();
                newContent.element = row[`${preFix}-element`];
            } else if (newContent.type == 'media' && row[`${preFix}-mediaId`]) {
                newContent.mediaId = row[`${preFix}-mediaId`];
                newContent.element = row[`${preFix}-element`];
                if (row[`${preFix}-caption`]) {
                    newContent.caption = row[`${preFix}-caption`];
                }
            }
            return newContent;
        }
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
        if (row['body-2-type'] && (row['body-2-text'] || row['body-2-mediaId'])) {
            const newContent = Page.makeContent('body-2', row);
            content.push(newContent);
        }
        if (row['body-3-type'] && (row['body-3-text'] || row['body-3-mediaId'])) {
            const newContent = Page.makeContent('body-3', row);

            content.push(newContent);
        }
        this.body = {
            transition: row['body-transition'],
            content,
        };
      
    }
}

module.exports = Page;
