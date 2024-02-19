const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Meta = imports.gi.Meta;

const EXTENSION_NAME = 'Window Screen Toggle';

const ToggleButton = GObject.registerClass({
}, class ToggleButton extends PanelMenu.Button {
    _init() {
        super._init(0.0, EXTENSION_NAME);
        let icon = new St.Icon({icon_name: 'view-grid-symbolic', style_class: 'system-status-icon'});
        this.add_child(icon);
        
        this.actor.connect('button-press-event', function() {
            let monitors = Main.layoutManager.monitors;
            let max_m = monitors.length;
            
            global.get_window_actors().forEach(function (window) {
                let mw = window.meta_window;
                let rect = mw.get_frame_rect();
                let id = mw.get_id();
                var i = 0;
                let monitor = mw.get_monitor();
                for(; i < max_m && i == monitor; i++) {}
                if (mw.is_skip_taskbar() || i == monitor) {
                    return;
                }
                
                let old_m = Main.layoutManager.monitors[monitor];
                let new_m = Main.layoutManager.monitors[i];
                let x = ((rect.x - old_m.x) / old_m.width) * new_m.width + new_m.x;
                let y = ((rect.y - old_m.y) / old_m.height) * new_m.height + new_m.y;
                let w = (rect.width / old_m.width) * new_m.width;
                let h = (rect.height / old_m.height) * new_m.height;
                
                let _maximized = mw.get_maximized();
                let _minimized = mw.minimized;
                
                if (mw.get_maximized())
                    mw.unmaximize(Meta.MaximizeFlags.BOTH);
                
                mw.move_to_monitor(i);
                mw.move_resize_frame(true, x, y, w, h);
                
                if (mw.get_maximized() !== _maximized) {
                    if (_maximized)
                        mw.maximize(_maximized);
                    else
                        mw.unmaximize(Meta.MaximizeFlags.BOTH);
                }

                if (mw.minimized !== _minimized) {
                    if (_minimized)
                        mw.minimize();
                    else
                        mw.unminimize();
                }
            });
        });
    }

    destroy() {
        super.destroy();
    }
});

let _toggleButton;

function init() {
}

function enable() {
    _toggleButton = new ToggleButton();
    Main.panel.addToStatusArea('toggle-button', _toggleButton, -1);
}

function disable() {
    if (_toggleButton) {
        _toggleButton.destroy();
        _toggleButton = null;
    }
}
