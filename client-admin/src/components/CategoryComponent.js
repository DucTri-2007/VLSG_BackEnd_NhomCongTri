import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class CategoryDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtName: ''
    };
  }

  render() {
    return (
      <div className="float-right card-panel" style={{ flex: 1, padding: '20px' }}>
        <h3 className="text-center" style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>CATEGORY DETAIL</h3>
        <form style={{ maxWidth: '400px', margin: '0 auto' }}>
          <table style={{ width: '100%', borderSpacing: '10px' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold', textAlign: 'right', color: '#ccc' }}>ID:</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtID}
                    onChange={(e) => this.setState({ txtID: e.target.value })}
                    readOnly={true}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', textAlign: 'right', color: '#ccc' }}>Name:</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtName}
                    onChange={(e) => this.setState({ txtName: e.target.value })}
                    placeholder="Enter category name..."
                    style={{ width: '100%', padding: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                  />
                </td>
              </tr>
              <tr>
                <td></td>
                <td style={{ paddingTop: '15px' }}>
                  <input
                    type="submit"
                    value="ADD NEW"
                    onClick={(e) => this.btnAddClick(e)}
                    style={{ padding: '8px 15px', marginRight: '8px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  />
                  <input
                    type="submit"
                    value="UPDATE"
                    onClick={(e) => this.btnUpdateClick(e)}
                    style={{ padding: '8px 15px', marginRight: '8px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  />
                  <input
                    type="submit"
                    value="DELETE"
                    onClick={(e) => this.btnDeleteClick(e)}
                    style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.item !== this.props.item) {
      this.setState({
        txtID: this.props.item ? this.props.item._id : '',
        txtName: this.props.item ? this.props.item.name : ''
      });
    }
  }

  // event-handlers
  btnAddClick(e) {
    e.preventDefault();
    const name = this.state.txtName;
    if (name) {
      const category = { name: name };
      this.apiPostCategory(category);
    } else {
      alert('Please input name');
    }
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = this.state.txtName;
    if (id && name) {
      const category = { name: name };
      this.apiPutCategory(id, category);
    } else {
      alert('Please select item and input name');
    }
  }

  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('ARE YOU SURE?')) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteCategory(id);
      } else {
        alert('Please select item to delete');
      }
    }
  }

  // apis
  apiPostCategory(category) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/categories', category, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('ADD CATEGORY SUCCESSFUL!');
        this.props.updateCategories();
        this.setState({ txtID: '', txtName: '' });
      } else {
        alert('ADD CATEGORY FAILED!');
      }
    });
  }

  apiPutCategory(id, category) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/categories/' + id, category, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('UPDATE CATEGORY SUCCESSFUL!');
        this.props.updateCategories();
      } else {
        alert('UPDATE CATEGORY FAILED!');
      }
    });
  }

  apiDeleteCategory(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/categories/' + id, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('DELETE CATEGORY SUCCESSFUL!');
        this.props.updateCategories();
        this.setState({ txtID: '', txtName: '' });
      } else {
        alert('DELETE CATEGORY FAILED!');
      }
    });
  }
}

class Category extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      itemSelected: null,
      searchKeyword: ''
    };
  }

  render() {
    const categories = Array.isArray(this.state.categories) ? this.state.categories : [];
    const filteredCategories = categories.filter((item) =>
      (item.name && item.name.toLowerCase().includes(this.state.searchKeyword.toLowerCase())) ||
      (item._id && item._id.toLowerCase().includes(this.state.searchKeyword.toLowerCase()))
    );

    const cates = filteredCategories.map((item) => {
      const isSelected = this.state.itemSelected && this.state.itemSelected._id === item._id;
      return (
        <tr
          key={item._id}
          className="datatable"
          onClick={() => this.trItemClick(item)}
          style={{
            cursor: 'pointer',
            backgroundColor: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
            transition: 'background-color 0.2s',
            color: isSelected ? '#00f2fe' : '#ccc'
          }}
        >
          <td style={{ padding: '10px', borderBottom: '1px solid #333' }}>{item._id}</td>
          <td style={{ padding: '10px', borderBottom: '1px solid #333', fontWeight: 'bold' }}>{item.name}</td>
        </tr>
      );
    });

    return (
      <div style={{ padding: '20px 30px' }}>
        <h2 className="text-center" style={{ textAlign: 'center', marginBottom: '25px', color: '#fff' }}>CATEGORY LIST</h2>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          <div className="float-left" style={{ flex: 1.2 }}>
            {/* Search Box */}
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="🔍 Search category by Name or ID..."
                value={this.state.searchKeyword}
                onChange={(e) => this.setState({ searchKeyword: e.target.value })}
                style={{ width: '100%', padding: '10px 15px', borderRadius: '6px', backgroundColor: '#222', color: '#fff', border: '1px solid #555', fontSize: '14px' }}
              />
            </div>
            <table className="datatable" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #444', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              <thead>
                <tr className="datatable" style={{ backgroundColor: 'rgba(30, 34, 51, 0.9)', color: '#fff' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #555' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #555' }}>Name</th>
                </tr>
              </thead>
              <tbody>
                {cates.length > 0 ? cates : (
                  <tr>
                    <td colSpan="2" style={{ padding: '20px', textAlign: 'center', color: '#777' }}>
                      No Categories Found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <CategoryDetail
            item={this.state.itemSelected}
            updateCategories={() => this.apiGetCategories()}
          />
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  // event-handlers
  trItemClick(item) {
    this.setState({ itemSelected: item });
  }

  // apis
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      const categories = res.data;
      this.setState({ categories: Array.isArray(categories) ? categories : [], itemSelected: null });
    }).catch(err => {
      console.log("No categories loaded (MongoDB offline)");
      this.setState({ categories: [], itemSelected: null });
    });
  }
}

export default Category;
