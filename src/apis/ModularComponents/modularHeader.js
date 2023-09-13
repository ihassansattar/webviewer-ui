import actions from 'actions';
import { ITEM_TYPE, ALIGNMENT, DEFAULT_GAP } from 'constants/customizationVariables';

export default (store) => (props) => {
  class ModularHeader {
    constructor(props) {
      const {
        label,
        dataElement,
        alignment,
        grow = 0,
        float = false,
        gap = DEFAULT_GAP,
        position,
        placement,
        maxWidth,
        maxHeight,
        items = [],
      } = props;
      this.label = label;
      this.dataElement = dataElement;
      this.placement = placement;
      this.alignment = alignment;
      this.grow = grow;
      this.gap = gap;
      this.position = position;
      this.float = float;
      this.maxWidth = maxWidth;
      this.maxHeight = maxHeight;
      // items is a list of things. We want to clone them
      this.items = items.map((item) => ({ ...item }));
      this.itemValidTypes = Object.values(ITEM_TYPE);
    }

    setGap(gap) {
      this.gap = gap;
      // What if the header already exists in redux? we must update it
      store.dispatch(actions.setGapBetweenHeaderItems(this.dataElement, gap));
    }

    // Validates the items type of a grouped item
    validateGroupedItems = (groupedItems) => {
      const items = groupedItems.items || groupedItems.props?.items;
      items?.forEach((item) => {
        this.isItemTypeValid(item);
      });
    };

    getGroupedItems() {
      return this.getItems(ITEM_TYPE.GROUPED_ITEMS);
    }

    getItems(type) {
      if (type) {
        return this.items.filter((item) => item.type === type);
      }
      return this.items;
    }

    addItemsHelper = (item) => {
      if (this.isItemTypeValid(item)) {
        const clonedItem = Object.assign({}, item);
        this.items.push(clonedItem);
      }
    };

    // Shows a warn if the item type is not valid.
    isItemTypeValid = (item) => {
      if (this.itemValidTypes.includes(item.type)) {
        // case it is a grouped items, validates its items as well
        if (item.type === ITEM_TYPE.GROUPED_ITEMS) {
          this.validateGroupedItems(item);
        }
        return true;
      }
      console.warn(`${item.type} is not a valid item type.`);
      return false;
    };

    addItems = (newItem) => {
      const state = store.getState();

      if (Array.isArray(newItem)) {
        newItem.forEach((item) => {
          this.addItemsHelper(item);
        });
      } else {
        this.addItemsHelper(newItem);
      }

      if (state.viewer.modularHeaders.length) {
        const modularHeaders = state.viewer.modularHeaders;
        modularHeaders.forEach((header, index, modularHeaders) => {
          if (header.dataElement === this.dataElement) {
            modularHeaders[index].items = this.items;
          }
        });
        store.dispatch(actions.updateModularHeaders(modularHeaders));
      }
    };

    setAlignment = (alignment) => {
      const validAlignments = Object.values(ALIGNMENT);
      if (!validAlignments.includes(alignment)) {
        console.warn(`${alignment} is not a valid value for alignment. Please use one of the following: ${validAlignments}`);
        return;
      }
      store.dispatch(actions.setHeaderAlignment(this.dataElement, alignment));
    };

    setMaxWidth = (maxWidth) => {
      if (isNaN(maxWidth)) {
        console.warn(`${maxWidth} is not a valid value for maxWidth. Please use a number, which represents the maximum width of the header in pixels.`);
        return;
      }
      store.dispatch(actions.setHeaderMaxWidth(this.dataElement, maxWidth));
    };

    setMaxHeight = (maxHeight) => {
      if (isNaN(maxHeight)) {
        console.warn(`${maxHeight} is not a valid value for maxHeight. Please use a number, which represents the maximum height of the header in pixels.`);
        return;
      }
      store.dispatch(actions.setHeaderMaxHeight(this.dataElement, maxHeight));
    };
  }

  return new ModularHeader(props);
};
